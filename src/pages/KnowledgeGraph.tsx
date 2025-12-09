import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Brain, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { NoteType } from '@/types/note';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { findSimilarNotes } from '@/services/embeddingService';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: NoteType | 'tag' | 'folder';
  val: number;
  color: string;
  isTag?: boolean;
  isFolder?: boolean;
  folderId?: string;
  starred?: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
  type: 'tag' | 'folder' | 'similarity';
}

const typeColors: Record<string, string> = {
  audio: '#3B82F6',
  video: '#8B5CF6',
  pdf: '#EF4444',
  youtube: '#DC2626',
  web: '#22C55E',
  text: '#EAB308',
  image: '#EC4899',
  tag: '#06B6D4',
  folder: '#F97316',
};

const KnowledgeGraph: React.FC = () => {
  const navigate = useNavigate();
  const { notes, folders } = useNotes();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const transformRef = useRef(d3.zoomIdentity);
  const { playClick, playWhoosh, playHover } = useSoundEffects();
  
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [showTags, setShowTags] = useState(true);
  const [showFolders, setShowFolders] = useState(true);
  const [showSimilarity, setShowSimilarity] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Build graph data
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const tagNodeIds = new Set<string>();
    const folderNodeIds = new Set<string>();

    let filteredNotes = notes.filter(n => n.inKnowledgeBase !== false);
    
    if (filterType !== 'all') {
      filteredNotes = filteredNotes.filter(n => n.type === filterType);
    }
    if (filterFolder !== 'all') {
      filteredNotes = filteredNotes.filter(n => n.folderId === filterFolder);
    }

    filteredNotes.forEach(note => {
      const contentLength = (note.transcript?.length || 0) + (note.extractedText?.length || 0);
      nodes.push({
        id: note.id,
        name: note.title,
        type: note.type,
        val: Math.max(5, Math.min(20, contentLength / 200)),
        color: typeColors[note.type] || '#6366F1',
        folderId: note.folderId,
        starred: note.starred,
      });

      if (showTags && note.tags) {
        note.tags.forEach(tagName => {
          const tagId = `tag-${tagName}`;
          if (!tagNodeIds.has(tagId)) {
            tagNodeIds.add(tagId);
            nodes.push({
              id: tagId,
              name: `#${tagName}`,
              type: 'tag',
              val: 8,
              color: typeColors.tag,
              isTag: true,
            });
          }
          links.push({
            source: note.id,
            target: tagId,
            value: 1,
            type: 'tag',
          });
        });
      }

      if (showFolders && note.folderId) {
        const folder = folders.find(f => f.id === note.folderId);
        if (folder) {
          const folderId = `folder-${note.folderId}`;
          if (!folderNodeIds.has(folderId)) {
            folderNodeIds.add(folderId);
            nodes.push({
              id: folderId,
              name: `📁 ${folder.name}`,
              type: 'folder',
              val: 12,
              color: typeColors.folder,
              isFolder: true,
            });
          }
          links.push({
            source: note.id,
            target: folderId,
            value: 2,
            type: 'folder',
          });
        }
      }

      if (showSimilarity) {
        const similarNotes = findSimilarNotes(note, filteredNotes, 3);
        similarNotes.forEach(({ note: similarNote, similarity }) => {
          const linkExists = links.some(l => 
            (l.source === note.id && l.target === similarNote.id) ||
            (l.source === similarNote.id && l.target === note.id)
          );
          if (!linkExists && similarity > 0.15) {
            links.push({
              source: note.id,
              target: similarNote.id,
              value: similarity * 3,
              type: 'similarity',
            });
          }
        });
      }
    });

    return { nodes, links };
  }, [notes, folders, filterType, filterFolder, showTags, showFolders, showSimilarity]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('graph-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3 Force Simulation
  useEffect(() => {
    if (!canvasRef.current || graphData.nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes = graphData.nodes.map(d => ({ ...d }));
    const links = graphData.links.map(d => ({ ...d }));

    // Create simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(80)
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius(d => d.val + 10));

    simulationRef.current = simulation;

    // Render function
    const render = () => {
      ctx.save();
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.k, transformRef.current.k);

      // Draw links
      links.forEach(link => {
        const source = link.source as GraphNode;
        const target = link.target as GraphNode;
        if (source.x === undefined || source.y === undefined || 
            target.x === undefined || target.y === undefined) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        
        const linkColor = link.type === 'similarity' ? 'rgba(139,92,246,0.4)' :
                         link.type === 'folder' ? 'rgba(249,115,22,0.4)' : 
                         'rgba(6,182,212,0.3)';
        ctx.strokeStyle = linkColor;
        ctx.lineWidth = link.value;
        ctx.stroke();

        // Draw particles on links
        const particleColor = link.type === 'similarity' ? '#8B5CF6' :
                             link.type === 'folder' ? '#F97316' : '#06B6D4';
        const t = (Date.now() % 3000) / 3000;
        const px = source.x + (target.x - source.x) * t;
        const py = source.y + (target.y - source.y) * t;
        
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, 2 * Math.PI);
        ctx.fillStyle = particleColor;
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach(node => {
        if (node.x === undefined || node.y === undefined) return;
        
        const size = node.val || 5;
        const color = node.color || '#6366F1';

        // Glow effect
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, `${color}40`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Main node
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Starred highlight
        if (node.starred) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Inner highlight
        ctx.beginPath();
        ctx.arc(node.x - size * 0.3, node.y - size * 0.3, size * 0.3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
      });

      ctx.restore();
    };

    simulation.on('tick', render);

    // Zoom behavior
    const zoom = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        render();
      });

    d3.select(canvas).call(zoom);

    // Drag behavior
    const drag = d3.drag<HTMLCanvasElement, unknown>()
      .subject((event) => {
        const [x, y] = transformRef.current.invert([event.x, event.y]);
        return nodes.find(n => {
          const dx = (n.x || 0) - x;
          const dy = (n.y || 0) - y;
          return Math.sqrt(dx * dx + dy * dy) < (n.val || 5) + 5;
        });
      })
      .on('start', (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        const node = event.subject as GraphNode;
        node.fx = node.x;
        node.fy = node.y;
      })
      .on('drag', (event) => {
        const node = event.subject as GraphNode;
        const [x, y] = transformRef.current.invert([event.x, event.y]);
        node.fx = x;
        node.fy = y;
      })
      .on('end', (event) => {
        if (!event.active) simulation.alphaTarget(0);
        const node = event.subject as GraphNode;
        node.fx = null;
        node.fy = null;
      });

    d3.select(canvas).call(drag);

    // Click and hover handling
    const handleCanvasClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const [x, y] = transformRef.current.invert([
        event.clientX - rect.left,
        event.clientY - rect.top
      ]);
      
      const clickedNode = nodes.find(n => {
        const dx = (n.x || 0) - x;
        const dy = (n.y || 0) - y;
        return Math.sqrt(dx * dx + dy * dy) < (n.val || 5) + 5;
      });

      if (clickedNode && !clickedNode.isTag && !clickedNode.isFolder) {
        playClick();
        navigate(`/note/${clickedNode.id}`);
      }
    };

    const handleCanvasMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const [x, y] = transformRef.current.invert([
        event.clientX - rect.left,
        event.clientY - rect.top
      ]);
      
      const hovered = nodes.find(n => {
        const dx = (n.x || 0) - x;
        const dy = (n.y || 0) - y;
        return Math.sqrt(dx * dx + dy * dy) < (n.val || 5) + 5;
      });

      if (hovered && !hovered.isTag && !hovered.isFolder && hovered !== hoveredNode) {
        playHover();
      }
      setHoveredNode(hovered || null);
      canvas.style.cursor = hovered && !hovered.isTag && !hovered.isFolder ? 'pointer' : 'grab';
    };

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);

    // Animation loop for particles
    let animationId: number;
    const animate = () => {
      render();
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      simulation.stop();
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [graphData, dimensions, navigate, playClick, playHover]);

  const handleZoomIn = () => {
    playClick();
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const zoom = d3.zoom<HTMLCanvasElement, unknown>();
      d3.select(canvas).transition().duration(500).call(
        zoom.scaleTo, transformRef.current.k * 1.5
      );
    }
  };

  const handleZoomOut = () => {
    playClick();
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const zoom = d3.zoom<HTMLCanvasElement, unknown>();
      d3.select(canvas).transition().duration(500).call(
        zoom.scaleTo, transformRef.current.k / 1.5
      );
    }
  };

  const handleReset = () => {
    playWhoosh();
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const zoom = d3.zoom<HTMLCanvasElement, unknown>();
      d3.select(canvas).transition().duration(1000).call(
        zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1)
      );
      transformRef.current = d3.zoomIdentity;
    }
  };

  const noteTypes = ['all', 'audio', 'pdf', 'youtube', 'text', 'web', 'image'];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border glass-strong">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center pulse-glow">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold flex items-center gap-2">
                Knowledge Graph 
                <Badge variant="outline" className="text-xs">D3</Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualize connections between {graphData.nodes.filter(n => !n.isTag && !n.isFolder).length} notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              <Select value={filterType} onValueChange={(v) => { playClick(); setFilterType(v); }}>
                <SelectTrigger className="w-32 glass">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  {noteTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterFolder} onValueChange={(v) => { playClick(); setFilterFolder(v); }}>
                <SelectTrigger className="w-36 glass">
                  <SelectValue placeholder="All folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Toggle buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={showTags ? 'default' : 'outline'}
                size="sm"
                onClick={() => { playClick(); setShowTags(!showTags); }}
                className="hover-glow"
              >
                Tags
              </Button>
              <Button
                variant={showFolders ? 'default' : 'outline'}
                size="sm"
                onClick={() => { playClick(); setShowFolders(!showFolders); }}
                className="hover-glow"
              >
                Folders
              </Button>
              <Button
                variant={showSimilarity ? 'default' : 'outline'}
                size="sm"
                onClick={() => { playClick(); setShowSimilarity(!showSimilarity); }}
                className="hover-glow"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Similar
              </Button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handleZoomIn} className="hover-glow">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomOut} className="hover-glow">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset} className="hover-glow">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div id="graph-container" className="flex-1 relative overflow-hidden">
        {/* Futuristic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
        
        {graphData.nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 pulse-glow">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No notes to visualize</h2>
            <p className="text-muted-foreground max-w-md">
              Create some notes and add tags to see how your ideas connect!
            </p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="absolute inset-0"
            style={{ cursor: 'grab' }}
          />
        )}

        {/* Hover tooltip */}
        {hoveredNode && !hoveredNode.isTag && !hoveredNode.isFolder && (
          <div className="absolute bottom-4 left-4 p-4 glass-strong rounded-xl shadow-2xl max-w-xs animate-fade-in futuristic-border">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className="uppercase text-xs"
                style={{ backgroundColor: `${typeColors[hoveredNode.type]}20`, color: typeColors[hoveredNode.type] }}
              >
                {hoveredNode.type}
              </Badge>
              {hoveredNode.starred && (
                <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50">★ Starred</Badge>
              )}
            </div>
            <h3 className="font-medium line-clamp-2">{hoveredNode.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">Click to view note</p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-4 right-4 p-4 glass-strong rounded-xl futuristic-border">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Legend
          </h4>
          <div className="space-y-2">
            {Object.entries(typeColors).slice(0, 7).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}50` }}
                />
                <span className="capitalize">{type}</span>
              </div>
            ))}
            <div className="border-t border-border/50 pt-2 mt-2">
              <div className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: typeColors.tag, boxShadow: `0 0 8px ${typeColors.tag}50` }}
                />
                <span>#Tags</span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: typeColors.folder, boxShadow: `0 0 8px ${typeColors.folder}50` }}
                />
                <span>📁 Folders</span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <div 
                  className="w-8 h-0.5 rounded" 
                  style={{ 
                    background: 'linear-gradient(90deg, #8B5CF6, transparent)',
                  }}
                />
                <span>Similarity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;

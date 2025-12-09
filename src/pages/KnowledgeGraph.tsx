import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
  Mic,
  FileText,
  Youtube,
  Globe,
  Image,
  Type
} from 'lucide-react';
import { NoteType } from '@/types/note';

interface GraphNode {
  id: string;
  name: string;
  type: NoteType;
  val: number;
  color: string;
  isTag?: boolean;
  isFolder?: boolean;
  folderId?: string;
  starred?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  type: 'tag' | 'folder';
}

const typeColors: Record<string, string> = {
  audio: 'hsl(220, 90%, 60%)',
  video: 'hsl(280, 80%, 60%)',
  pdf: 'hsl(0, 80%, 60%)',
  youtube: 'hsl(0, 100%, 50%)',
  web: 'hsl(150, 70%, 50%)',
  text: 'hsl(45, 90%, 55%)',
  image: 'hsl(320, 70%, 60%)',
  tag: 'hsl(180, 70%, 50%)',
  folder: 'hsl(35, 90%, 55%)',
};

const typeIcons: Record<string, React.FC<{ className?: string }>> = {
  audio: Mic,
  video: Mic,
  pdf: FileText,
  youtube: Youtube,
  web: Globe,
  text: Type,
  image: Image,
};

const KnowledgeGraph: React.FC = () => {
  const navigate = useNavigate();
  const { notes, folders, tags } = useNotes();
  const graphRef = useRef<any>(null);
  
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [showTags, setShowTags] = useState(true);
  const [showFolders, setShowFolders] = useState(true);
  const [linkDistance, setLinkDistance] = useState([100]);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

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

  // Build graph data
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const tagNodeIds = new Set<string>();
    const folderNodeIds = new Set<string>();

    // Filter notes
    let filteredNotes = notes.filter(n => n.inKnowledgeBase !== false);
    
    if (filterType !== 'all') {
      filteredNotes = filteredNotes.filter(n => n.type === filterType);
    }
    if (filterFolder !== 'all') {
      filteredNotes = filteredNotes.filter(n => n.folderId === filterFolder);
    }

    // Create note nodes
    filteredNotes.forEach(note => {
      const contentLength = (note.transcript?.length || 0) + (note.extractedText?.length || 0);
      nodes.push({
        id: note.id,
        name: note.title,
        type: note.type,
        val: Math.max(5, Math.min(20, contentLength / 200)),
        color: typeColors[note.type] || 'hsl(200, 50%, 50%)',
        folderId: note.folderId,
        starred: note.starred,
      });

      // Create tag connections
      if (showTags && note.tags) {
        note.tags.forEach(tagName => {
          const tagId = `tag-${tagName}`;
          if (!tagNodeIds.has(tagId)) {
            tagNodeIds.add(tagId);
            nodes.push({
              id: tagId,
              name: `#${tagName}`,
              type: 'text',
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

      // Create folder connections
      if (showFolders && note.folderId) {
        const folder = folders.find(f => f.id === note.folderId);
        if (folder) {
          const folderId = `folder-${note.folderId}`;
          if (!folderNodeIds.has(folderId)) {
            folderNodeIds.add(folderId);
            nodes.push({
              id: folderId,
              name: `📁 ${folder.name}`,
              type: 'text',
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
    });

    // Create connections between notes that share tags
    const tagToNotes: Record<string, string[]> = {};
    filteredNotes.forEach(note => {
      note.tags?.forEach(tag => {
        if (!tagToNotes[tag]) tagToNotes[tag] = [];
        tagToNotes[tag].push(note.id);
      });
    });

    return { nodes, links };
  }, [notes, folders, filterType, filterFolder, showTags, showFolders]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (node.isTag || node.isFolder) return;
    navigate(`/note/${node.id}`);
  }, [navigate]);

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.5, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.5, 400);
    }
  };

  const handleReset = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = Math.max(10 / globalScale, 3);
    ctx.font = `${fontSize}px Inter, sans-serif`;
    
    const nodeSize = node.val || 5;
    
    // Draw glow for starred notes
    if (node.starred) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize + 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'hsla(45, 100%, 50%, 0.3)';
      ctx.fill();
    }

    // Draw node
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    
    // Different styles for different node types
    if (node.isTag) {
      ctx.fillStyle = node.color;
      ctx.strokeStyle = 'hsl(180, 70%, 70%)';
      ctx.lineWidth = 2 / globalScale;
    } else if (node.isFolder) {
      ctx.fillStyle = node.color;
      ctx.strokeStyle = 'hsl(35, 90%, 70%)';
      ctx.lineWidth = 2 / globalScale;
    } else {
      ctx.fillStyle = node.color;
      ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.3)';
      ctx.lineWidth = 1 / globalScale;
    }
    
    ctx.fill();
    ctx.stroke();

    // Draw label
    if (globalScale > 0.5 || node.isTag || node.isFolder) {
      ctx.fillStyle = 'hsl(0, 0%, 90%)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.slice(0, 20), node.x, node.y + nodeSize + fontSize);
    }
  }, []);

  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = link.source;
    const end = link.target;
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    
    ctx.strokeStyle = link.type === 'folder' 
      ? 'hsla(35, 70%, 50%, 0.4)' 
      : 'hsla(180, 50%, 50%, 0.3)';
    ctx.lineWidth = link.value / globalScale;
    ctx.stroke();
  }, []);

  const noteTypes = ['all', 'audio', 'pdf', 'youtube', 'text', 'web', 'image'];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">Knowledge Graph</h1>
              <p className="text-sm text-muted-foreground">
                Visualize connections between {graphData.nodes.filter(n => !n.isTag && !n.isFolder).length} notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
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

              <Select value={filterFolder} onValueChange={setFilterFolder}>
                <SelectTrigger className="w-36">
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
                onClick={() => setShowTags(!showTags)}
              >
                Tags
              </Button>
              <Button
                variant={showFolders ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFolders(!showFolders)}
              >
                Folders
              </Button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div id="graph-container" className="flex-1 relative bg-gradient-to-br from-background via-background to-primary/5">
        {graphData.nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Brain className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No notes to visualize</h2>
            <p className="text-muted-foreground max-w-md">
              Create some notes and add tags to see how your ideas connect!
            </p>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            nodeCanvasObject={nodeCanvasObject}
            linkCanvasObject={linkCanvasObject}
            onNodeClick={handleNodeClick}
            onNodeHover={setHoveredNode}
            nodeRelSize={6}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            cooldownTicks={100}
            backgroundColor="transparent"
          />
        )}

        {/* Hover tooltip */}
        {hoveredNode && !hoveredNode.isTag && !hoveredNode.isFolder && (
          <div className="absolute bottom-4 left-4 p-4 bg-card border border-border rounded-xl shadow-lg max-w-xs animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="uppercase text-xs">
                {hoveredNode.type}
              </Badge>
              {hoveredNode.starred && (
                <Badge variant="outline" className="text-xs">★ Starred</Badge>
              )}
            </div>
            <h3 className="font-medium line-clamp-2">{hoveredNode.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">Click to view note</p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-4 right-4 p-4 bg-card/90 backdrop-blur border border-border rounded-xl">
          <h4 className="font-medium text-sm mb-3">Legend</h4>
          <div className="space-y-2">
            {Object.entries(typeColors).slice(0, 7).map(([type, color]) => {
              const Icon = typeIcons[type];
              return (
                <div key={type} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="capitalize">{type}</span>
                </div>
              );
            })}
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: typeColors.tag }}
                />
                <span>#Tags</span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: typeColors.folder }}
                />
                <span>📁 Folders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Link distance slider */}
        <div className="absolute bottom-4 right-4 p-4 bg-card/90 backdrop-blur border border-border rounded-xl w-48">
          <h4 className="font-medium text-sm mb-3">Link Distance</h4>
          <Slider
            value={linkDistance}
            onValueChange={setLinkDistance}
            min={30}
            max={200}
            step={10}
          />
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;

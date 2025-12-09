# Sprint 001: Voice Agent + Notes Context Integration

**Sprint Duration:** 1-2 sessions  
**Status:** 🟡 In Progress  
**Started:** 2024-12-09

---

## Sprint Goal
Complete the voice agent integration with notes context so users can have voice conversations with Zen that reference their saved notes.

---

## Prioritized Tasks

### Priority 1: Verify Voice + Notes Integration ⏳
- [ ] Add 2-3 test notes with distinct content
- [ ] Start voice session and check console for `notesContext` log
- [ ] Ask agent questions about note contents
- [ ] Verify agent responses reference actual note data

### Priority 2: UI/UX Indicators 📋
- [ ] Add visual indicator showing number of notes loaded into context
- [ ] Display "Context: X notes loaded" before voice session starts
- [ ] Add "Listening..." state indicator
- [ ] Add "Speaking..." state indicator
- [ ] Show real-time voice transcript

### Priority 3: Error Handling 📋
- [ ] Handle microphone permission denied gracefully
- [ ] Handle ElevenLabs connection failures
- [ ] Add retry mechanism for failed connections
- [ ] Show user-friendly error messages

### Priority 4: Polish & Testing 📋
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test with various note quantities (0, 1, 10, 50 notes)
- [ ] Optimize context length for token limits
- [ ] Add loading states during connection

---

## Acceptance Criteria

### Must Have
1. ✅ Voice agent connects successfully with Agent ID
2. ⏳ Notes context is passed to agent prompt
3. ⏳ Agent can answer questions about user's notes
4. ⏳ User can see when agent is listening vs speaking

### Should Have
1. 📋 Visual indicator of notes loaded into context
2. 📋 Real-time transcript display
3. 📋 Graceful error handling

### Nice to Have
1. 📋 Context preview before starting session
2. 📋 Ability to filter which notes are included

---

## Dependencies & Blockers

### Dependencies
- ElevenLabs API key configured ✅
- Agent created in ElevenLabs dashboard ✅
- Notes system functional (can create/read notes) ✅

### Potential Blockers
- ElevenLabs rate limits (monitor usage)
- Token limits for large note contexts
- Browser microphone permissions

---

## Technical Notes

### Key Files
- `src/hooks/useVoiceAgent.ts` - Voice agent hook
- `src/pages/Assistant.tsx` - Assistant page with buildContext()
- `src/contexts/NotesContext.tsx` - Notes state management

### Architecture Decision
Using ElevenLabs `sessionConfig.overrides` to inject notes context into the agent prompt dynamically, rather than creating separate agents per user.

---

## Estimated Effort
| Task | Estimate |
|------|----------|
| Verify integration | 30 min |
| UI indicators | 1-2 hours |
| Error handling | 1 hour |
| Testing & polish | 1-2 hours |
| **Total** | **4-6 hours** |

---

## Definition of Done
- [ ] Voice agent successfully references note content in responses
- [ ] User can visually see when notes are loaded
- [ ] Error states are handled gracefully
- [ ] Tested on Chrome and at least one other browser

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface IComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isInternal: boolean; // Managed explicitly according to data privacy criteria[cite: 1, 3]
}

export const EmployeeReportDetail: React.FC<{ reportId: string }> = ({ reportId }) => {
  const statusWorkflow = ['New', 'Needs Info', 'Triaged', 'Valid / Duplicate', 'Closed']; // Lifecycle rules[cite: 1]
  const [currentStatus, setCurrentStatus] = useState('New');
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [chatMode, setChatMode] = useState<'public' | 'internal'>('public'); // Real-time toggle separation[cite: 1, 3]
  const API_BASE = import.meta.env.VITE_API_URL || 'https://bugspace-pro-3.onrender.com';

  // Read API base proxy endpoint to fetch technical information and logs natively
  useEffect(() => {
    async function fetchReportDetails() {
      try {
        const response = await axios.get(`${API_BASE}/api/reports/${reportId}`);
        setCurrentStatus(response.data.status);
      } catch (err) {
        console.error('Error fetching report details via proxy server:', err);
      }
    }
    fetchReportDetails();
  }, [reportId, API_BASE]);

  // Real-time Chat Thread Listener Simulator mapping onto your Render network socket layer[cite: 1, 2]
  useEffect(() => {
    // This connects to the express proxy route where the backend executes onSnapshot tracking[cite: 1, 2]
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/reports/${reportId}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error('Chat thread sync failed:', err);
      }
    }, 3000); // Polls/streams data seamlessly over proxy context execution lines[cite: 2]

    return () => clearInterval(interval);
  }, [reportId, API_BASE]);

  // Task: Implement Status Management changes instantly[cite: 2]
  const handleStatusUpdate = async (nextStatus: string) => {
    try {
      setCurrentStatus(nextStatus);
      await axios.patch(`${API_BASE}/api/reports/${reportId}/status`, { status: nextStatus });
      alert(`Status changed to ${nextStatus} successfully via central server proxy!`);
    } catch (err) {
      console.error('Failed to commit triage status updates:', err);
    }
  };

  // Task: Post comments to distinct target channels matching PRD rules[cite: 1, 3]
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const payload = {
        text: newComment,
        isInternal: chatMode === 'internal' // Ensures notes remain hidden from researcher interfaces[cite: 1, 3]
      };
      
      await axios.post(`${API_BASE}/api/reports/${reportId}/comments`, payload);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post message safely over database firewall:', err);
    }
  };

  return (
    <div style={{ background: '#0b0f19', color: '#fff', padding: '24px', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', margin: '0' }}>Vulnerability Handling Matrix</h2>
        <p style={{ color: '#9ca3af', fontSize: '13px' }}>Target ID Node: {reportId}</p>
      </div>

      {/* Task: Status Management Horizontal Selector Block[cite: 5] */}
      <div style={{ background: '#111827', padding: '16px', borderRadius: '8px', border: '1px solid #1f2937', marginBottom: '24px' }}>
        <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>Triage Tracking Controls</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {statusWorkflow.map(status => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              style={{
                padding: '8px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: currentStatus === status ? '#6366f1' : '#1f2937', color: '#fff'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task: Build Internal Note Toggle vs Public Messaging Thread[cite: 1, 3] */}
      <div style={{ background: '#111827', borderRadius: '8px', border: '1px solid #1f2937', overflow: 'hidden' }}>
        <div style={{ display: 'flex', background: '#1f2937' }}>
          <button onClick={() => setChatMode('public')} style={{ flex: 1, padding: '12px', border: 'none', background: chatMode === 'public' ? '#111827' : 'transparent', color: chatMode === 'public' ? '#6366f1' : '#9ca3af', cursor: 'pointer', fontWeight: 'bold' }}>
            💬 Public Chat
          </button>
          <button onClick={() => setChatMode('internal')} style={{ flex: 1, padding: '12px', border: 'none', background: chatMode === 'internal' ? '#111827' : 'transparent', color: chatMode === 'internal' ? '#f59e0b' : '#9ca3af', cursor: 'pointer', fontWeight: 'bold' }}>
            🔒 Internal Notes Toggle
          </button>
        </div>

        {/* Message Stream */}
        <div style={{ padding: '20px', minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments
            .filter(c => chatMode === 'internal' ? true : !c.isInternal) // Strict data isolation rules applied[cite: 1, 3]
            .map(c => (
              <div key={c.id} style={{ background: c.isInternal ? '#78350f' : '#1f2937', padding: '12px', borderRadius: '6px', alignSelf: 'flex-start', minWidth: '40%' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>{c.author}</div>
                <div style={{ fontSize: '14px' }}>{c.text}</div>
              </div>
            ))}
        </div>

        {/* Submit Form Area */}
        <form onSubmit={handleCommentSubmit} style={{ padding: '12px', background: '#1f2937', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={chatMode === 'internal' ? "Write private internal note..." : "Reply publicly to researcher..."}
            style={{ flex: 1, padding: '10px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '4px', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '10px 16px', background: chatMode === 'internal' ? '#f59e0b' : '#6366f1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Post Message
          </button>
        </form>
      </div>
    </div>
  );
};
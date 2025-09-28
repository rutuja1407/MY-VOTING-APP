import React, { useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import {
  FiShield,
  FiUserCheck,
  FiBarChart2,
  FiLayers,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUser,
  FiInfo,
  FiShare2,
  FiSettings,
  FiPlus,
  FiUpload,
  FiDownload,
  FiPlay,
  FiPause,
  FiAlertTriangle,
  FiCheck,
  FiTrendingUp,
  FiUsers,
  FiActivity,
  FiTarget,
} from "react-icons/fi";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editIndex, setEditIndex] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [snackbar, setSnackbar] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [modalTab, setModalTab] = useState("basic");
  const fileInputRef = useRef(null);
  
  // Bulk operations state
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const emptyForm = {
    name: "",
    age: "",
    party: "",
    position: "",
    email: "",
    phone: "",
    image: "",
    description: "",
    status: "active", // Default status
  };
  const [form, setForm] = useState(emptyForm);
  const navigate = useNavigate()
  
  // FIXED: Reset all candidate votes to 0 initially
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "John Smith",
      age: "45",
      party: "Democratic Party",
      position: "President",
      email: "john.smith@email.com",
      phone: "+1-555-0123",
      image: "https://example.com/john.jpg",
      description: "Experienced leader with a vision for economic growth and national unity.",
      status: "active",
      votes: 0, // FIXED: Set to 0
    },
    {
      id: 2,
      name: "Sarah Johnson",
      age: "38",
      party: "Republican Party",
      position: "Governor",
      email: "sarah.johnson@email.com",
      phone: "+1-555-0124",
      image: "https://example.com/sarah.jpg",
      description: "Former state senator focused on education reform and innovation.",
      status: "active",
      votes: 0, // FIXED: Set to 0
    },
    {
      id: 3,
      name: "Michael Chen",
      age: "52",
      party: "Independent",
      position: "Mayor",
      email: "michael.chen@email.com",
      phone: "+1-555-0125",
      image: "https://example.com/michael.jpg",
      description: "Local businessman committed to transparent governance.",
      status: "suspended",
      votes: 0, // FIXED: Set to 0
    },
  ]);

  // Dynamic Analytics Data - Computed from actual candidate data
  const analyticsData = useMemo(() => {
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    const activeCandidates = candidates.filter(c => c.status === 'active').length;
    const inactiveCandidates = candidates.filter(c => c.status === 'inactive').length;
    const suspendedCandidates = candidates.filter(c => c.status === 'suspended').length;
    
    // Calculate unique positions and parties
    const uniquePositions = [...new Set(candidates.map(c => c.position))].length;
    const uniqueParties = [...new Set(candidates.map(c => c.party))].length;
    
    // Calculate trends (mock previous values for demonstration)
    const previousTotalVotes = totalVotes > 0 ? Math.floor(totalVotes * 0.89) : 0; // Simulate 11% growth
    const votesChange = previousTotalVotes > 0 ? Math.round(((totalVotes - previousTotalVotes) / previousTotalVotes) * 100) : 0;
    
    const previousActiveCandidates = Math.max(0, activeCandidates - 1);
    const activeCandidatesChange = activeCandidates - previousActiveCandidates;

    return {
      totalVotes,
      totalVotesChange: votesChange,
      activeCandidates,
      activeCandidatesChange,
      inactiveCandidates,
      suspendedCandidates,
      uniquePositions,
      uniqueParties,
      activeSessions: activeCandidates > 0 ? 1 : 0,
      activeSessionsStatus: activeCandidates > 0 ? 'Live' : 'Inactive',
      averageVotesPerCandidate: candidates.length > 0 ? Math.round(totalVotes / candidates.length) : 0
    };
  }, [candidates]);

  const topPerformingCandidates = useMemo(() => {
    return candidates
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 3)
      .map((candidate, index) => ({
        ...candidate,
        rank: index + 1,
        percentage: analyticsData.totalVotes > 0 ? Math.round((candidate.votes / analyticsData.totalVotes) * 100) : 0
      }));
  }, [candidates, analyticsData.totalVotes]);

  const handleAddCandidate = () => {
    setForm(emptyForm);
    setValidationError("");
    setModalMode("add");
    setEditIndex(null);
    setModalOpen(true);
    setModalTab("basic");
  };

  const handleEditCandidate = (idx) => {
    setForm(candidates[idx]);
    setValidationError("");
    setEditIndex(idx);
    setModalMode("edit");
    setModalOpen(true);
    setModalTab("basic");
  };

  const handleDeleteCandidate = (index) => {
    setDeleteOpen(true);
    setDeleteIndex(index);
  };

  const confirmDeleteCandidate = () => {
    setCandidates((prev) => prev.filter((_, idx) => idx !== deleteIndex));
    setDeleteOpen(false);
    setSnackbar(true);
    setTimeout(() => setSnackbar(false), 2200);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (
      !form.name.trim() ||
      !form.image.trim() ||
      !form.position.trim() ||
      !form.party.trim() ||
      !form.description.trim()
    ) {
      setValidationError("Please fill all required fields: Name, Image URL, Position, Party, and Description.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSaveCandidate = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (modalMode === "add") {
      const newCandidate = { 
        ...form, 
        id: Date.now(), // Simple ID generation
        status: form.status || "active",
        votes: 0, // FIXED: Always start with 0 votes
      };
      setCandidates([...candidates, newCandidate]);
    } else if (modalMode === "edit" && editIndex !== null) {
      setCandidates(
        candidates.map((cand, idx) => (idx === editIndex ? { ...form } : cand))
      );
    }
    setModalOpen(false);
    setForm(emptyForm);
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCandidates(new Set());
      setSelectAll(false);
    } else {
      setSelectedCandidates(new Set(candidates.map(c => c.id)));
      setSelectAll(true);
    }
  };

  const handleSelectCandidate = (candidateId) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId);
    } else {
      newSelected.add(candidateId);
    }
    setSelectedCandidates(newSelected);
    setSelectAll(newSelected.size === candidates.length);
  };

  // CSV Import functionality
  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error("Please select a valid CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = e.target.result;
        const lines = csvData.split('\n');
        
        if (lines.length < 2) {
          toast.error("CSV file must contain at least header and one data row");
          return;
        }

        // Parse CSV header
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        
        // Validate required headers
        const requiredHeaders = ['name', 'party', 'position', 'description'];
        const missingHeaders = requiredHeaders.filter(header => 
          !headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
        );

        if (missingHeaders.length > 0) {
          toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }

        // Parse data rows
        const newCandidates = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
          
          if (values.length !== headers.length) continue;

          const candidate = {};
          headers.forEach((header, index) => {
            const key = header.toLowerCase();
            candidate[key] = values[index] || '';
          });

          // Ensure required fields exist
          if (candidate.name && candidate.party && candidate.position && candidate.description) {
            newCandidates.push({
              id: Date.now() + i, // Unique ID
              name: candidate.name,
              age: candidate.age || '',
              party: candidate.party,
              position: candidate.position,
              email: candidate.email || '',
              phone: candidate.phone || '',
              image: candidate.image || '',
              description: candidate.description,
              status: candidate.status || 'active',
              votes: 0, // FIXED: Start imported candidates with 0 votes
            });
          }
        }

        if (newCandidates.length > 0) {
          setCandidates(prev => [...prev, ...newCandidates]);
          toast.success(`Successfully imported ${newCandidates.length} candidates`);
        } else {
          toast.error("No valid candidate data found in CSV file");
        }

      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error("Error parsing CSV file. Please check the format.");
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Clear file input
  };

  // CSV Export functionality
  const handleExportCSV = () => {
    try {
      // Define CSV headers
      const headers = ['Name', 'Age', 'Party', 'Position', 'Email', 'Phone', 'Image', 'Description', 'Status', 'Votes'];
      
      // Convert candidates data to CSV format
      const csvContent = [
        headers.join(','), // Header row
        ...candidates.map(candidate => [
          `"${candidate.name}"`,
          `"${candidate.age}"`,
          `"${candidate.party}"`,
          `"${candidate.position}"`,
          `"${candidate.email}"`,
          `"${candidate.phone}"`,
          `"${candidate.image}"`,
          `"${candidate.description}"`,
          `"${candidate.status}"`,
          `"${candidate.votes}"`
        ].join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success(`Successfully exported ${candidates.length} candidates to CSV`);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error("Error exporting data to CSV");
    }
  };

  // Bulk action handlers
  const handleBulkActivate = () => {
    if (selectedCandidates.size === 0) {
      toast.error("Please select candidates to activate");
      return;
    }
    
    setCandidates(prev => 
      prev.map(candidate => 
        selectedCandidates.has(candidate.id) 
          ? { ...candidate, status: 'active' }
          : candidate
      )
    );
    
    toast.success(`Activated ${selectedCandidates.size} candidates`);
    setSelectedCandidates(new Set());
    setSelectAll(false);
  };

  const handleBulkDeactivate = () => {
    if (selectedCandidates.size === 0) {
      toast.error("Please select candidates to deactivate");
      return;
    }
    
    setCandidates(prev => 
      prev.map(candidate => 
        selectedCandidates.has(candidate.id) 
          ? { ...candidate, status: 'inactive' }
          : candidate
      )
    );
    
    toast.success(`Deactivated ${selectedCandidates.size} candidates`);
    setSelectedCandidates(new Set());
    setSelectAll(false);
  };

  const handleBulkSuspend = () => {
    if (selectedCandidates.size === 0) {
      toast.error("Please select candidates to suspend");
      return;
    }
    
    setCandidates(prev => 
      prev.map(candidate => 
        selectedCandidates.has(candidate.id) 
          ? { ...candidate, status: 'suspended' }
          : candidate
      )
    );
    
    toast.success(`Suspended ${selectedCandidates.size} candidates`);
    setSelectedCandidates(new Set());
    setSelectAll(false);
  };

  const handleBulkDelete = () => {
    if (selectedCandidates.size === 0) {
      toast.error("Please select candidates to delete");
      return;
    }
    
    setCandidates(prev => 
      prev.filter(candidate => !selectedCandidates.has(candidate.id))
    );
    
    toast.success(`Deleted ${selectedCandidates.size} candidates`);
    setSelectedCandidates(new Set());
    setSelectAll(false);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      active: { background: '#e8f5e8', color: '#27a827' },
      inactive: { background: '#fff3e0', color: '#ff9500' },
      suspended: { background: '#ffeaea', color: '#ea4545' }
    };
    
    return statusStyles[status] || statusStyles.active;
  };

  function EditCandidateModal({ open, onClose, tab, setTab }) {
    if (!open) return null;

    return (
      <div className="candidate-modal-overlay">
        <div className="candidate-modal">
          <button className="candidate-modal-close" onClick={onClose}>
            <FiX size={24} />
          </button>
          <h2 className="candidate-modal-title">{modalMode === "edit" ? "Edit Candidate" : "Add Candidate"}</h2>
          <div className="candidate-modal-tabs">
            <button className={`candidate-modal-tab${tab === "basic" ? " active" : ""}`} onClick={() => setTab("basic")}><FiUser /> Basic</button>
            <button className={`candidate-modal-tab${tab === "details" ? " active" : ""}`} onClick={() => setTab("details")}><FiInfo /> Details</button>
            <button className={`candidate-modal-tab${tab === "social" ? " active" : ""}`} onClick={() => setTab("social")}><FiShare2 /> Social</button>
            <button className={`candidate-modal-tab${tab === "settings" ? " active" : ""}`} onClick={() => setTab("settings")}><FiSettings /> Settings</button>
          </div>
          <form className="candidate-modal-content" onSubmit={handleSaveCandidate}>
            {validationError && (
              <div className="validation-error">{validationError}</div>
            )}
            {tab === "basic" && (
              <>
                <div className="candidate-modal-section-title">Basic Information</div>
                <div className="candidate-modal-grid">
                  <input name="name" value={form.name} onChange={handleFormChange} type="text" placeholder="Enter candidate name" />
                  <input name="age" value={form.age} onChange={handleFormChange} type="number" placeholder="Enter age" />
                  <input name="party" value={form.party} onChange={handleFormChange} type="text" placeholder="Enter party name" />
                  <select name="position" value={form.position} onChange={handleFormChange}>
                    <option value="">Select position</option>
                    <option>President</option>
                    <option>Governor</option>
                    <option>Mayor</option>
                  </select>
                  <input name="email" value={form.email} onChange={handleFormChange} type="email" placeholder="Enter email address" />
                  <input name="phone" value={form.phone} onChange={handleFormChange} type="text" placeholder="Enter phone number" />
                  <input name="image" value={form.image} onChange={handleFormChange} type="text" placeholder="Enter image URL" />
                </div>
              </>
            )}
            {tab === "details" && (
              <>
                <div className="candidate-modal-section-title">Qualifications & Experience</div>
                <div className="candidate-modal-grid">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input type="text" placeholder="Add qualification" style={{ flex: 1 }} />
                    <button className="candidate-modal-qual-add"><FiPlus /></button>
                  </div>
                  <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Describe relevant experience" style={{ gridColumn: "span 2" }} />
                  <textarea placeholder="Enter election manifesto and key policies" style={{ gridColumn: "span 2" }} />
                </div>
              </>
            )}
            {tab === "social" && (
              <>
                <div className="candidate-modal-section-title">Social Media Links</div>
                <div className="candidate-modal-grid">
                  <input type="text" placeholder="https://twitter.com/username" />
                  <input type="text" placeholder="https://facebook.com/username" />
                  <input type="text" placeholder="https://instagram.com/username" />
                </div>
              </>
            )}
            {tab === "settings" && (
              <>
                <div className="candidate-modal-section-title">Candidate Settings</div>
                <div className="candidate-modal-grid">
                  <select name="status" value={form.status} onChange={handleFormChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </>
            )}
            <div className="candidate-modal-actions">
              <button className="candidate-modal-cancel" type="button" onClick={onClose}>Cancel</button>
              <button className="candidate-modal-save" type="submit">
                {modalMode === "edit" ? "Update Candidate" : "Add Candidate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function DeleteCandidateModal({ open, onClose, onDelete }) {
    if (!open) return null;
    return (
      <div className="candidate-modal-overlay">
        <div className="delete-modal">
          <button className="candidate-modal-close" onClick={onClose}><FiX size={24} /></button>
          <h2 className="delete-modal-title">Delete Candidate</h2>
          <div className="delete-modal-desc">
            Are you sure you want to delete this candidate? This action cannot be undone.
          </div>
          <div className="candidate-modal-actions" style={{ marginTop: "2rem" }}>
            <button className="candidate-modal-cancel" onClick={onClose}>Cancel</button>
            <button className="delete-modal-btn" onClick={onDelete}>Delete</button>
          </div>
        </div>
      </div>
    );
  }

  function Snackbar({ open }) {
    if (!open) return null;
    return (
      <div className="snackbar">
        <span>✓ Candidate deleted successfully!</span>
      </div>
    );
  }
  
  const handleLogout = () => {
    toast.success("Logout successfull")
    navigate('/',{replace:true});
  };

  return (
    <div className="admin-dash-container">
      <header className="dash-header">
        <div className="dash-title-area">
          <span className="dash-icon"><FiShield size={40} /></span>
          <div>
            <div className="dash-title">Admin Dashboard</div>
            <div className="dash-subtitle">Online Voting System</div>
          </div>
        </div>
        <button className="dash-logout-btn" onClick={handleLogout}>Logout</button>
      </header>
      <nav className="dash-nav">
        <div className={`dash-nav-item${activeTab === "overview" ? " dash-nav-active" : ""}`} onClick={() => setActiveTab("overview")}>
          <FiUserCheck /> Overview
        </div>
        <div className={`dash-nav-item${activeTab === "candidates" ? " dash-nav-active" : ""}`} onClick={() => setActiveTab("candidates")}>
          <FiUserCheck /> Candidates <span className="nav-count">{candidates.length}</span>
        </div>
        <div className={`dash-nav-item${activeTab === "analytics" ? " dash-nav-active" : ""}`} onClick={() => setActiveTab("analytics")}>
          <FiBarChart2 /> Analytics
        </div>
        <div className={`dash-nav-item${activeTab === "bulk" ? " dash-nav-active" : ""}`} onClick={() => setActiveTab("bulk")}>
          <FiLayers /> Bulk Operations
        </div>
      </nav>
      <main className="dash-main">
        {activeTab === "overview" && (
          <>
            <div className="dash-section-header">
              <h2>Admin Dashboard</h2>
              <div className="dash-desc">Comprehensive management system for your online voting platform with facial detection</div>
            </div>
            <div className="dash-cards">
              <div className="dash-card"><div className="dash-card-title">Total Candidates</div><div className="dash-card-value">{candidates.length}</div></div>
              <div className="dash-card"><div className="dash-card-title">Positions</div><div className="dash-card-value">{analyticsData.uniquePositions}</div></div>
              <div className="dash-card"><div className="dash-card-title">Political Parties</div><div className="dash-card-value">{analyticsData.uniqueParties}</div></div>
              <div className="dash-card"><div className="dash-card-title">System Status</div><div className="dash-card-value dash-active-status">Active</div></div>
            </div>
          </>
        )}
        {activeTab === "candidates" && (
          <div className="candidate-panel-container">
            <div className="candidate-management-header">
              <div className="candidate-management-title">
                <FiUserPlus size={32} className="candidate-panel-icon" />
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#6a5ae0" }}>Candidate Management</div>
                  <div style={{ fontSize: "1rem", color: "#818398" }}>Manage candidates for the voting system</div>
                </div>
              </div>
              <button className="add-candidate-btn" onClick={handleAddCandidate}>
                <FiUserPlus size={20} style={{ marginRight: "8px" }} />
                Add Candidate
              </button>
            </div>
            <div className="candidate-table">
              <div className="candidate-table-header">
                <div></div>
                <div>Name</div>
                <div>Party</div>
                <div>Position</div>
                <div>Description</div>
                <div>Actions</div>
              </div>
              {candidates.map((c, idx) => (
                <div className="candidate-table-row" key={idx}>
                  <div className="candidate-avatar">{c.name[0]}</div>
                  <div className="candidate-info">{c.name}</div>
                  <div><span className="candidate-party">{c.party}</span></div>
                  <div><span className="candidate-position">{c.position}</span></div>
                  <div className="candidate-desc">{c.description}</div>
                  <div className="candidate-actions">
                    <button className="candidate-edit-btn" onClick={() => handleEditCandidate(idx)}><FiEdit2 size={20} /></button>
                    <button className="candidate-delete-btn" onClick={() => handleDeleteCandidate(idx)}><FiTrash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB WITH DYNAMIC DATA - REMOVED COMPLETION RATE CARD */}
        {activeTab === "analytics" && (
          <div className="analytics-container">
            <div className="analytics-header">
              <div className="analytics-title">
                <FiBarChart2 size={32} className="analytics-icon" />
                <div>
                  <div className="analytics-main-title">Analytics Dashboard</div>
                  <div className="analytics-subtitle">Real-time voting insights and performance metrics</div>
                </div>
              </div>
            </div>

            {/* Analytics Cards Grid with Dynamic Data - ONLY 3 CARDS NOW */}
            <div className="analytics-cards-grid">
              {/* Total Votes Cast Card */}
              <div className="analytics-card votes-card">
                <div className="analytics-card-header">
                  <div className="analytics-card-icon blue">
                    <FiBarChart2 size={20} />
                  </div>
                  <div className="analytics-card-title">Total Votes Cast</div>
                </div>
                <div className="analytics-card-content">
                  <div className="analytics-card-value">{analyticsData.totalVotes.toLocaleString()}</div>
                  <div className={`analytics-card-trend ${analyticsData.totalVotesChange >= 0 ? 'positive' : 'negative'}`}>
                    <FiTrendingUp size={14} />
                    <span>{analyticsData.totalVotesChange >= 0 ? '+' : ''}{analyticsData.totalVotesChange}%</span>
                  </div>
                </div>
              </div>

              {/* Active Candidates Card */}
              <div className="analytics-card candidates-card">
                <div className="analytics-card-header">
                  <div className="analytics-card-icon purple">
                    <FiUsers size={20} />
                  </div>
                  <div className="analytics-card-title">Active Candidates</div>
                </div>
                <div className="analytics-card-content">
                  <div className="analytics-card-value">{analyticsData.activeCandidates}</div>
                  <div className={`analytics-card-trend ${analyticsData.activeCandidatesChange >= 0 ? 'positive' : 'negative'}`}>
                    <FiTrendingUp size={14} />
                    <span>{analyticsData.activeCandidatesChange >= 0 ? '+' : ''}{analyticsData.activeCandidatesChange}</span>
                  </div>
                </div>
              </div>

              {/* Active Sessions Card */}
              <div className="analytics-card sessions-card">
                <div className="analytics-card-header">
                  <div className="analytics-card-icon green">
                    <FiActivity size={20} />
                  </div>
                  <div className="analytics-card-title">Active Sessions</div>
                </div>
                <div className="analytics-card-content">
                  <div className="analytics-card-value">{analyticsData.activeSessions}</div>
                  <div className={`analytics-card-status ${analyticsData.activeSessionsStatus === 'Live' ? 'live' : 'inactive'}`}>
                    <span>{analyticsData.activeSessionsStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ENHANCED Top Performing Candidates Section with Better Design */}
            <div className="top-performers-section">
              <div className="top-performers-header">
                <div className="top-performers-icon">
                  <FiTarget size={24} />
                </div>
                <h3>Top Performing Candidates</h3>
              </div>
              
              <div className="top-performers-list">
                {topPerformingCandidates.map((candidate) => (
                  <div key={candidate.id} className="top-performer-item">
                    <div className="performer-left-section">
                      <div className={`performer-rank rank-${candidate.rank}`}>
                        {candidate.rank}
                      </div>
                      <div className="performer-avatar">
                        <img src={candidate.image} alt={candidate.name} onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }} />
                        <div className="performer-avatar-fallback" style={{display: 'none'}}>
                          {candidate.name[0]}
                        </div>
                      </div>
                    </div>
                    
                    <div className="performer-info">
                      <div className="performer-name">{candidate.name}</div>
                      <div className="performer-position">{candidate.position}</div>
                    </div>
                    
                    <div className="performer-stats">
                      <div className="performer-votes">{candidate.votes} votes</div>
                      <div className="performer-percentage">{candidate.percentage}%</div>
                      <div className="performer-progress">
                        <div 
                          className="performer-progress-fill" 
                          style={{width: `${candidate.percentage}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BULK OPERATIONS TAB WITH CANDIDATE LIST */}
        {activeTab === "bulk" && (
          <div className="bulk-operations-container">
            <div className="bulk-operations-header">
              <div className="bulk-operations-title">
                <FiLayers size={32} className="bulk-operations-icon" />
                <div>
                  <div className="bulk-title">Bulk Operations</div>
                  <div className="bulk-subtitle">Import, export, and manage candidates in bulk</div>
                </div>
              </div>
            </div>

            {/* Hidden file input for CSV import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              style={{ display: 'none' }}
            />

            <div className="bulk-operations-grid">
              {/* Import Candidates Section */}
              <div className="bulk-section import-section">
                <div className="bulk-section-header">
                  <FiUpload className="section-icon" size={24} />
                  <h3>Import Candidates</h3>
                </div>
                <p className="bulk-section-desc">Upload CSV file or paste data to import multiple candidates</p>
                <div className="bulk-action-area">
                  <button className="bulk-import-btn" onClick={handleImportData}>
                    <FiUpload size={20} />
                    Import Data
                  </button>
                  <div className="bulk-file-icon">
                    <FiUpload size={24} />
                  </div>
                </div>
              </div>

              {/* Export Candidates Section */}
              <div className="bulk-section export-section">
                <div className="bulk-section-header">
                  <FiDownload className="section-icon" size={24} />
                  <h3>Export Candidates</h3>
                </div>
                <p className="bulk-section-desc">Download all candidate data as CSV file</p>
                <div className="bulk-action-area">
                  <button className="bulk-export-btn" onClick={handleExportCSV}>
                    <FiDownload size={20} />
                    Export CSV
                  </button>
                  <div className="bulk-candidates-count">{candidates.length} candidates available</div>
                </div>
              </div>
            </div>

            {/* Bulk Actions Section */}
            <div className="bulk-actions-section">
              <div className="bulk-actions-header">
                <FiUser className="section-icon" size={24} />
                <h3>Bulk Actions</h3>
              </div>
              <div className="bulk-actions-grid">
                <button className="bulk-action-btn activate-btn" onClick={handleBulkActivate}>
                  <FiPlay size={20} />
                  Activate Selected
                </button>
                <button className="bulk-action-btn deactivate-btn" onClick={handleBulkDeactivate}>
                  <FiPause size={20} />
                  Deactivate Selected
                </button>
                <button className="bulk-action-btn suspend-btn" onClick={handleBulkSuspend}>
                  <FiAlertTriangle size={20} />
                  Suspend Selected
                </button>
                <button className="bulk-action-btn delete-btn" onClick={handleBulkDelete}>
                  <FiTrash2 size={20} />
                  Delete Selected
                </button>
              </div>
              <div className="selected-count">Selected: {selectedCandidates.size} candidates</div>
            </div>

            {/* CANDIDATE LIST WITH CHECKBOXES */}
            <div className="bulk-candidate-list">
              <div className="bulk-list-header">
                <h3>Candidate List</h3>
                <p>Select candidates to perform bulk actions</p>
              </div>
              
              <div className="bulk-candidate-table">
                <div className="bulk-table-header">
                  <div className="bulk-checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="bulk-checkbox"
                    />
                  </div>
                  <div>Name</div>
                  <div>Party</div>
                  <div>Position</div>
                  <div>Status</div>
                </div>
                
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="bulk-table-row">
                    <div className="bulk-checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.has(candidate.id)}
                        onChange={() => handleSelectCandidate(candidate.id)}
                        className="bulk-checkbox"
                      />
                    </div>
                    <div className="bulk-candidate-info">
                      <div className="bulk-candidate-avatar">{candidate.name[0]}</div>
                      <span>{candidate.name}</span>
                    </div>
                    <div>
                      <span className="bulk-candidate-party">{candidate.party}</span>
                    </div>
                    <div>
                      <span className="bulk-candidate-position">{candidate.position}</span>
                    </div>
                    <div>
                      <span 
                        className="bulk-candidate-status"
                        style={getStatusBadge(candidate.status)}
                      >
                        {candidate.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <EditCandidateModal open={modalOpen} onClose={() => setModalOpen(false)} tab={modalTab} setTab={setModalTab} />
        <DeleteCandidateModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onDelete={confirmDeleteCandidate} />
        <Snackbar open={snackbar} />
      </main>
    </div>
  );
}

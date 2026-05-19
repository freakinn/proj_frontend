import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import Sidebar from "./FacultySideBar";
import "../../styles/EvaluationSelection.css";

const EvaluationSelection = () => {
    const [facultyId, setFacultyId] = useState(null);
    const [phase, setPhase] = useState("");
    const [semester, setSemester] = useState("");
    const [year, setYear] = useState("");
    const [evaluators, setEvaluators] = useState(null);
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [projID, setProjID] = useState(null);
    const [evaluu, setEvaluu] = useState(false);
    const [semesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
    const [years, setYears] = useState([]);
    const [evaluationData, setEvaluationData] = useState({});
    const [guide] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showForm, setShowForm] = useState(true);
    const [panelNumber, setPanelNumber] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            const decodedToken = jwtDecode(token);
            setFacultyId(decodedToken.id);
        }

        const currentYear = new Date().getFullYear();
        setYears(Array.from({ length: 2 }, (_, i) => currentYear - i));
    }, []);

    const fetchEvaluators = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5173/api/eveSettings/evaluators?semester=${semester}&year=${year}&facultyId=${facultyId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch evaluators");
            }

            const data = await response.json();
            console.log("Evaluators Data:", data);
            setEvaluators(data);
            
            // Check if current faculty is the chair in the evaluators document
            if (data.length > 0 && data[0].evaluators.chair.faculty === facultyId) {
                setPanelNumber(data[0].panelNumber);
            } else {
                if (data.length > 0) {
                    setPanelNumber(data[0].panelNumber);
                }
            }
        } catch (error) {
            console.error("Error fetching evaluators:", error);
            setEvaluators(null);
        }
    }, [semester, year, facultyId]);

    useEffect(() => {
        if (phase && semester && year) {
            fetchEvaluators();
        }
    }, [phase, semester, year, fetchEvaluators]);

    const handleBackButton = () => {
        if (evaluu) {
            setEvaluu(false);
        } else if (!showForm) {
            window.location.reload();
        } else {
            setShowForm(true);
        }
    };

    const fetchProjects = async () => {
        if (!evaluators || evaluators.length === 0) {
            alert("No evaluators found. Please select phase, semester, and year.");
            return;
        }

        // Check if current faculty is the chair
        if (evaluators[0].evaluators.chair.faculty !== facultyId) {
            return; // Don't proceed if not chair
        }

        const facultyIds = Object.values(evaluators[0].evaluators)
            .filter(evaluator => evaluator.faculty)
            .map(evaluator => evaluator.faculty);

        try {
            const response = await fetch("http://localhost:5173/api/request/projects/getProjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ facultyIds, semester, year })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }

            const data = await response.json();
            console.log("Projects Data:", data);
            setProjects(data);
            setShowForm(false);
        } catch (error) {
            console.error("Error fetching projects:", error);
            setProjects([]);
        }
    };

    const handleEvaluate = (projectId) => {
        setProjID(projectId);
        setEvaluu(true);
    };

    const handleEvaluationChange = (teamMemberId, evaluatorId, value) => {
        if (!/^\d*\.?\d*$/.test(value)) {
            return;
        }

        const score = parseFloat(value);
        const maxScore = phase === "Mid-Term" ? 15 : 35;

        if (score < 0 || score > maxScore) {
            setFieldErrors((prevErrors) => ({
                ...prevErrors,
                [`${teamMemberId}-${evaluatorId}`]: `Score must be between 0 and ${maxScore} for ${phase}`,
            }));

            setEvaluationData((prevData) => ({
                ...prevData,
                [teamMemberId]: {
                    ...prevData[teamMemberId],
                    [evaluatorId]: {
                        ...prevData[teamMemberId]?.[evaluatorId],
                        score: "",
                    },
                },
            }));
            return;
        }

        setFieldErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };
            delete updatedErrors[`${teamMemberId}-${evaluatorId}`];
            return updatedErrors;
        });

        setEvaluationData((prevData) => ({
            ...prevData,
            [teamMemberId]: {
                ...prevData[teamMemberId],
                [evaluatorId]: {
                    ...prevData[teamMemberId]?.[evaluatorId],
                    score: value,
                },
            },
        }));
    };

    const handleViewMarks = (project) => {
        const marksWindow = window.open('', '_blank', 'width=800,height=600');
        
        marksWindow.document.write(`
          <html>
            <head>
              <title>Evaluation Marks - ${project.Title}</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background-color: #f8f9fa;
                  padding: 2rem;
                }
                .marks-container {
                  background: white;
                  border-radius: 10px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                  padding: 2rem;
                  margin: 0 auto;
                  max-width: 800px;
                }
                .project-header {
                  border-bottom: 2px solid #e9ecef;
                  padding-bottom: 1rem;
                  margin-bottom: 2rem;
                }
                .marks-table {
                  width: 100%;
                }
                .marks-table th {
                  background-color: #f1f8ff;
                  color: #0d6efd;
                  font-weight: 600;
                }
                .complete-row {
                  background-color: #f0fff4 !important;
                }
                .incomplete-row {
                  background-color: #fff8f8 !important;
                }
                .status-badge {
                  font-size: 0.75rem;
                  padding: 0.35em 0.65em;
                  border-radius: 50rem;
                }
                @media (max-width: 768px) {
                  body {
                    padding: 1rem;
                  }
                  .marks-container {
                    padding: 1rem;
                  }
                }
              </style>
            </head>
            <body>
              <div class="marks-container">
                <div class="project-header">
                  <h2 class="text-primary mb-2">${project.Title}</h2>
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <span class="badge bg-secondary">Semester: ${project.semester}</span>
                    <span class="badge bg-secondary">Year: ${project.year}</span>
                    <span class="badge bg-info text-dark">Faculty: ${project.facultyName}</span>
                  </div>
                </div>
                
                <div class="table-responsive">
                  <table class="table marks-table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Team Member</th>
                        <th>Mid-Term</th>
                        <th>End-Term</th>
                        ${project.teamMembers.some(m => m.midTermMarks && m.endTermMarks) ? 
                          '<th>Total</th><th>Grade</th><th>Status</th>' : ''}
                      </tr>
                    </thead>
                    <tbody>
                      ${project.teamMembers.map(member => `
                        <tr class="${member.midTermMarks && member.endTermMarks ? 'complete-row' : 'incomplete-row'}">
                          <td>
                            <strong>${member.name}</strong><br>
                            <small class="text-muted">${member.roll} • ${member.branch}</small>
                          </td>
                          <td>${member.midTermMarks ?? '-'}</td>
                          <td>${member.endTermMarks ?? '-'}</td>
                          ${member.midTermMarks && member.endTermMarks ? `
                            <td><strong>${member.totalMarks ?? '-'}</strong></td>
                            <td>
                              <span class="status-badge ${getGradeColor(member.grade)}">
                                ${member.grade ?? '-'}
                              </span>
                            </td>
                            <td>
                              <span class="status-badge bg-success">Complete</span>
                            </td>
                          ` : ''}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <script>
                function getGradeColor(grade) {
                  if (!grade) return 'bg-secondary';
                  const gradeMap = {
                    'A+': 'bg-success',
                    'A': 'bg-success',
                    'B+': 'bg-primary',
                    'B': 'bg-primary',
                    'C+': 'bg-warning',
                    'C': 'bg-warning',
                    'D': 'bg-danger',
                    'F': 'bg-dark'
                  };
                  return gradeMap[grade] || 'bg-secondary';
                }
              </script>
            </body>
          </html>
        `);
        marksWindow.document.close();
      };
      
      // Helper function for grade colors
      const getGradeColor = (grade) => {
        if (!grade) return 'bg-secondary';
        const gradeMap = {
          'A+': 'bg-success',
          'A': 'bg-success',
          'B+': 'bg-primary',
          'B': 'bg-primary',
          'C+': 'bg-warning',
          'C': 'bg-warning',
          'D': 'bg-danger',
          'F': 'bg-dark'
        };
        return gradeMap[grade] || 'bg-secondary';
      };

    const handleSaveEvaluation = async () => {
        try {
          const currentProject = projects.find(project => project._id === projID);
          
          // Prepare team members with scores
          const teamMembersWithScores = currentProject.teamMembers.map(member => {
            // Get evaluator IDs from the evaluators data
            const chairId = evaluators[0].evaluators.chair.faculty;
            const evaluator2Id = evaluators[0].evaluators.evaluator2.faculty;
            const evaluator3Id = evaluators[0].evaluators.evaluator3.faculty;
      
            return {
              id: member.id,
              name: member.name,
              roll: member.roll,
              branch: member.branch,
              scores: {
                chair: parseFloat(evaluationData[member.id]?.[chairId]?.score) || 0,
                evaluator2: parseFloat(evaluationData[member.id]?.[evaluator2Id]?.score) || 0,
                evaluator3: parseFloat(evaluationData[member.id]?.[evaluator3Id]?.score) || 0
              }
            };
          });
      
          const payload = {
            projectId: projID,
            semester,
            year,
            panelNumber,
            phase,
            teamMembers: teamMembersWithScores,
            evaluators: {
              chair: {
                faculty: evaluators[0].evaluators.chair.faculty,
                name: evaluators[0].evaluators.chair.name
              },
              evaluator2: {
                faculty: evaluators[0].evaluators.evaluator2.faculty,
                name: evaluators[0].evaluators.evaluator2.name
              },
              evaluator3: {
                faculty: evaluators[0].evaluators.evaluator3.faculty,
                name: evaluators[0].evaluators.evaluator3.name
              }
            }
          };
      
          console.log("Payload being sent:", payload); // Debug log
      
          const response = await fetch("http://localhost:5173/api/eveSettings/saveEvaluationMarks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(payload)
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save evaluation");
          }
      
          const result = await response.json();
          alert(result.message);
          setEvaluu(false);
          fetchProjects();
      
        } catch (error) {
          console.error("Evaluation save error:", error);
          alert(`Save failed: ${error.message}`);
        }
      };

      const filteredProjects = projects.filter(project => {
        const matchesSearch = project.Title.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Only show projects that have completed Mid-Term evaluation when in End-Term phase
        if (phase === "End-Term") {
          return matchesSearch && project.midTermEvaluated;
        }
        
        // Show all projects for Mid-Term phase
        return matchesSearch;
      });

    return (
        <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
            <Sidebar />
            <div className="container mt-4" style={{ overflowY: "auto", padding: "20px" }}>
                <h4 className="m-4 mt-3 text-success fw-bold">Project Evaluation</h4>
                <div className="mx-4 mb-4 border-bottom border-3 rounded-5" />

                {showForm ? (
                    <>
                        <div className="mb-3">
                            <label className="form-label d-block">Select Phase:</label>
                            <div className="form-check form-check-inline custom-radio">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="midTerm"
                                    name="phase"
                                    value="Mid-Term"
                                    checked={phase === "Mid-Term"}
                                    onChange={(e) => setPhase(e.target.value)}
                                />
                                <label className="form-check-label" htmlFor="midTerm">Mid-Term</label>
                            </div>
                            <div className="form-check form-check-inline custom-radio">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="endTerm"
                                    name="phase"
                                    value="End-Term"
                                    checked={phase === "End-Term"}
                                    onChange={(e) => setPhase(e.target.value)}
                                />
                                <label className="form-check-label" htmlFor="endTerm">End-Term</label>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Select Semester:</label>
                            <select className="form-select" value={semester} onChange={(e) => setSemester(e.target.value)}>
                                <option value="">Select Semester</option>
                                {semesters.map((sem) => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Select Year:</label>
                            <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                                <option value="">Select Year</option>
                                {years.map((yr) => (
                                    <option key={yr} value={yr}>{yr}</option>
                                ))}
                            </select>
                        </div>

                        <button className="btn btn-primary" onClick={fetchProjects}>OK</button>

                        {/* Show message if not chair */}
                        {evaluators && evaluators.length > 0 && evaluators[0].evaluators.chair.faculty !== facultyId && (
                            <div className="alert alert-danger mt-3 animate__animated animate__fadeIn" 
                                style={{ 
                                    borderLeft: '5px solid #ff6b6b',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 20px rgba(220, 53, 69, 0.15)',
                                    background: 'linear-gradient(to right, #fff5f5, #fff)',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    padding: '1.5rem'
                                }}>
                                
                                {/* Animated decorative element */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: '5px',
                                    background: 'linear-gradient(to bottom, #ff6b6b, #ff8787)'
                                }}></div>
                                
                                <div className="d-flex align-items-start">
                                    <div style={{
                                        background: '#ff6b6b',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '1rem',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
                                    }}>
                                        <i className="bi bi-shield-lock-fill text-white" style={{ fontSize: '1.25rem' }}></i>
                                    </div>
                                    
                                    <div>
                                        <h5 className="mb-2" style={{
                                            color: '#343a40',
                                            fontWeight: 600,
                                            letterSpacing: '0.5px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ 
                                                background: '#ff6b6b',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                display: 'inline-block',
                                                marginRight: '8px'
                                            }}></span>
                                            Restricted Access
                                        </h5>
                                        
                                        <p className="mb-3" style={{
                                            color: '#495057',
                                            lineHeight: 1.5,
                                            fontSize: '1.05rem'
                                        }}>
                                            You don't have <span style={{
                                                fontWeight: 700,
                                                color: '#d23369',
                                                position: 'relative',
                                                padding: '0 2px'
                                            }}>chair</span> privileges for this evaluation panel.
                                        </p>
                                        
                                        <div className="d-flex gap-3">
                                            <div style={{
                                                background: 'rgba(255, 107, 107, 0.1)',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '6px',
                                                border: '1px dashed rgba(255, 107, 107, 0.3)'
                                            }}>
                                                <div className="text-muted small mb-1">Semester</div>
                                                <div className="fw-bold" style={{ color: '#ff6b6b' }}>
                                                    {evaluators[0].semester}
                                                </div>
                                            </div>
                                            
                                            <div style={{
                                                background: 'rgba(255, 107, 107, 0.1)',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '6px',
                                                border: '1px dashed rgba(255, 107, 107, 0.3)'
                                            }}>
                                                <div className="text-muted small mb-1">Panel No.</div>
                                                <div className="fw-bold" style={{ color: '#ff6b6b' }}>
                                                    {evaluators[0].panelNumber}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 pt-2 border-top border-light">
                                            <small className="text-muted">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Please contact administration if you believe this is incorrect
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            className="btn btn-secondary mb-3"
                            onClick={handleBackButton}
                        >
                            <i className="bi bi-arrow-left"></i> Back
                        </button>

                        {!evaluu ? (
                            <div className="mt-4">
                                <div className="mt-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by project title"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <h4 className="mb-3">Projects</h4>
                                <div className="row">
                                    {filteredProjects.map((project) => (
                                        <div key={project._id} className="col-md-6 mb-4">
                                            <div className="card h-100 shadow-sm">
                                                <div className="card-body">
                                                    <h5 className="card-title text-primary">
                                                        <i className="bi bi-file-earmark-text me-2"></i>
                                                        {project.Title}
                                                    </h5>
                                                    <hr />
                                                    <p className="card-text">
                                                        <i className="bi bi-card-text text-secondary me-2"></i>
                                                        <strong>Content:</strong> {project.Content}
                                                    </p>
                                                    <p className="card-text">
                                                        <i className="bi bi-calendar-check text-info me-2"></i>
                                                        <strong>Year:</strong> {project.year}
                                                    </p>
                                                    <p className="card-text">
                                                        <i className="bi bi-book text-warning me-2"></i>
                                                        <strong>Semester:</strong> {project.semester}
                                                    </p>
                                                    <p className="card-text">
                                                        <i className="bi bi-person-workspace text-success me-2"></i>
                                                        <strong>Faculty:</strong> {project.facultyName}
                                                    </p>

                                                    <h6 className="mt-3">
                                                        <i className="bi bi-people-fill me-2"></i>Team Members:
                                                    </h6>
                                                    <ul className="list-group list-group-flush">
                                                        {project.teamMembers.map((member, idx) => (
                                                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                                                <span>
                                                                    <i className="bi bi-person-circle me-2"></i> {member.name} ({member.branch} - {member.roll})
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    <div className="d-flex gap-2 mt-3">
  <button
    className={`btn ${
      (phase === "Mid-Term" && project.midTermEvaluated) || 
      (phase === "End-Term" && project.endTermEvaluated) 
        ? "btn-warning" 
        : "btn-success"
    }`}
    onClick={() => handleEvaluate(project._id)}
    disabled={
      (phase === "Mid-Term" && project.midTermEvaluated) ||
      (phase === "End-Term" && project.endTermEvaluated)
    }
  >
    {(phase === "Mid-Term" && project.midTermEvaluated) || 
     (phase === "End-Term" && project.endTermEvaluated) 
      ? "EDIT" 
      : "EVALUATE"}
  </button>

  {/* Add View Marks button when in edit mode */}
  {((phase === "Mid-Term" && project.midTermEvaluated) || 
    (phase === "End-Term" && project.endTermEvaluated)) && (
    <button 
      className="btn btn-info"
      onClick={() => handleViewMarks(project)}
    >
      VIEW MARKS
    </button>
  )}
</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <h4 className="mb-3">Evaluation Form</h4>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSaveEvaluation();
                                }}>
                                    <input type="hidden" name="projID" value={projID} />

                                    <div className="mb-4 p-3 border rounded bg-light">
                                        <h5 className="text-primary mb-3">Guide:</h5>
                                        <select
                                            className="form-select"
                                            value={guide || projects.find((project) => project._id === projID)?.Faculty}
                                            disabled
                                        >
                                            <option value="">Select Guide</option>
                                            {evaluators && evaluators[0]?.evaluators && Object.entries(evaluators[0].evaluators).map(([role, evaluator]) => (
                                                <option
                                                    key={`${role}-${evaluator.name}`}
                                                    value={evaluator.faculty || `${role}-${evaluator.name}`}
                                                >
                                                    {evaluator.name} ({role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {projects
                                        .find((project) => project._id === projID)
                                        ?.teamMembers.map((teamMember) => (
                                            <div key={teamMember.id} className="mb-4 p-3 border rounded">
                                                <h5 className="text-primary">
                                                    <i className="bi bi-person-circle me-2"></i>
                                                    {teamMember.name} ({teamMember.branch} - {teamMember.roll})
                                                </h5>
                                                {evaluators && evaluators[0]?.evaluators && Object.entries(evaluators[0].evaluators).map(([role, evaluator]) => {
                                                    const fieldKey = `${teamMember.id}-${evaluator.faculty}`;
                                                    const fieldError = fieldErrors[fieldKey];

                                                    return (
                                                        <div key={role} className="mb-3">
                                                            <label className="fw-bold">{evaluator.name} ({role}):</label>
                                                            <input
                                                                type="text"
                                                                className="form-control mb-2"
                                                                placeholder="Score"
                                                                value={evaluationData[teamMember.id]?.[evaluator.faculty]?.score || ""}
                                                                onChange={(e) => handleEvaluationChange(teamMember.id, evaluator.faculty, e.target.value)}
                                                                required
                                                            />
                                                            {fieldError && (
                                                                <div className="text-danger small">{fieldError}</div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}

                                            <button 
                                            type="button" // Changed from "submit"
                                            className="btn btn-success"
                                            onClick={handleSaveEvaluation}
                                            disabled={Object.keys(fieldErrors).length > 0}
                                            >
                                            Save Evaluation
                                            </button>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EvaluationSelection;

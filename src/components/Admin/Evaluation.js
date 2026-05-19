import React, { useState, useEffect } from "react";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";
import Sidebar from './AdminSideBar';
import "../../styles/PanelIncre.css";

const Evaluation = () => {
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [panelNumber, setPanelNumber] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [existingEvaluations, setExistingEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvaluationId, setEditingEvaluationId] = useState(null);
  const [evaluators, setEvaluators] = useState({
    chair: { name: "", email: "", isManual: false },
    evaluator2: { name: "", email: "", isManual: false },
    evaluator3: { name: "", email: "", isManual: false },
  });
  const [SavedSem, setSavedSem] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedYears, setExpandedYears] = useState({
    currentYear: false,
    previousYear: false
  });

  // Check if all required fields are filled and panel number is not duplicate
  const isSaveDisabled = () => {
    if (!semester || !year || !panelNumber) return true;
    
    // Check if all evaluators are filled
    for (const role in evaluators) {
      if (!evaluators[role].name || !evaluators[role].email) {
        return true;
      }
    }
    
    // Check for duplicate panel number
    if (filteredEvaluations.some(evaluation => 
      evaluation.panelNumber === parseInt(panelNumber) && 
      (!isEditing || evaluation._id !== editingEvaluationId)
    )) {
      return true;
    }
    
    return false;
  };

  const toggleYearSection = (yearType) => {
    setExpandedYears(prev => ({
      ...prev,
      [yearType]: !prev[yearType]
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      jwtDecode(token);
    }
  }, []);

  useEffect(() => {
    getFaculty();
    fetchExistingEvaluations();
  }, []);

  useEffect(() => {
    const semestersForYear = existingEvaluations
      .filter(evaluation => evaluation.year === year)
      .map(evaluation => evaluation.semester);
    setSavedSem(semestersForYear);
  }, [year, existingEvaluations]);

  useEffect(() => {
    if (year && semester) {
      const filtered = existingEvaluations.filter(
        evaluation => evaluation.year === parseInt(year) && evaluation.semester === parseInt(semester)
      );
      setFilteredEvaluations(filtered);
    } else {
      setFilteredEvaluations([]);
    }
  }, [year, semester, existingEvaluations]);

  const getFaculty = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5173/api/faculty");
      if (response.ok) {
        const data = await response.json();
        setFacultyList(
          data.map((faculty) => ({
            value: faculty.name,
            label: faculty.name,
            email: faculty.email,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching faculty data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingEvaluations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5173/api/eveSettings/");
      if (response.ok) {
        const data = await response.json();
        setExistingEvaluations(data);
      } else {
        setExistingEvaluations([]);
      }
    } catch (error) {
      console.error("Error fetching existing evaluations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSemester("");
    setYear(new Date().getFullYear());
    setPanelNumber("");
    setEvaluators({
      chair: { name: "", email: "", isManual: false },
      evaluator2: { name: "", email: "", isManual: false },
      evaluator3: { name: "", email: "", isManual: false },
    });
    setIsEditing(false);
    setEditingEvaluationId(null);
  };

  const handleEditEvaluation = (evaluation) => {
    setSemester(evaluation.semester);
    setYear(evaluation.year);
    setPanelNumber(evaluation.panelNumber || "");
    setEvaluators(evaluation.evaluators);
    setIsEditing(true);
    setEditingEvaluationId(evaluation._id);
    setShowForm(true);

    if (!SavedSem.includes(evaluation.semester)) {
      setSavedSem([...SavedSem, evaluation.semester]);
    }
  };

  const handleFacultySelect = (role, selectedOption) => {
    setEvaluators({
      ...evaluators,
      [role]: {
        name: selectedOption?.value || "",
        email: selectedOption?.email || "",
        isManual: false,
      },
    });
  };

  const handleManualToggle = (role) => {
    setEvaluators({
      ...evaluators,
      [role]: {
        name: "",
        email: "",
        isManual: !evaluators[role].isManual,
      },
    });
  };

  const handleManualInputChange = (role, field, value) => {
    setEvaluators({
      ...evaluators,
      [role]: {
        ...evaluators[role],
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    if (isSaveDisabled()) return;

    const data = {
      semester,
      year,
      panelNumber,
      evaluators: Object.fromEntries(
        Object.entries(evaluators).map(([role, evaluator]) => [
          role,
          {
            name: evaluator.name,
            email: evaluator.email,
            isManual: evaluator.isManual,
          },
        ])
      ),
    };

    try {
      setIsLoading(true);
      const url = isEditing
        ? `http://localhost:5173/api/eveSettings/evaluation/${editingEvaluationId}`
        : "http://localhost:5173/api/eveSettings/evaluation";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? "update" : "save"}`);
      }

      await fetchExistingEvaluations();
      setShowForm(false);
      setExpandedYears({
        currentYear: true,
        previousYear: false
      });
      alert(`Evaluation ${isEditing ? 'updated' : 'saved'} successfully!`);
    } catch (error) {
      console.error('Save error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredFacultyList = (role) => {
    const assignedEvaluators = filteredEvaluations.flatMap(evaluation => 
      Object.values(evaluation.evaluators).map(e => e.email)
    );
    
    const currentFormEvaluators = Object.entries(evaluators)
      .filter(([r, e]) => r !== role && e.email && !e.isManual)
      .map(([, e]) => e.email);
  
    const allAssignedEmails = [...assignedEvaluators, ...currentFormEvaluators];
  
    return facultyList.filter(faculty => 
      !allAssignedEmails.includes(faculty.email) || 
      faculty.email === evaluators[role].email
    );
  };

  const currentYearEvaluations = existingEvaluations.filter(
    evaluation => evaluation.year === new Date().getFullYear()
  );

  const previousYearEvaluations = existingEvaluations.filter(
    evaluation => evaluation.year === new Date().getFullYear() - 1
  );

  return (
    <div className="d-flex">
      <div>
        <Sidebar />
      </div>

      <div className="container mt-4">
        <h4 className="m-4 mt-3 text-success fw-bold">Evaluation Settings</h4>
        <div className="mx-4 mb-4 border-bottom border-3 rounded-5" />

        {isLoading && (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <button
          className="btn btn-info mb-3"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          disabled={isLoading}
        >
          Add Details
        </button>

        {showForm && (
          <div className="border p-3 mb-4">
            <h4 className="mb-3 text-primary fw-bold">
              Evaluation Panel Setup
            </h4>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label>Year:</label>
                <input
                  type="number"
                  className=" form-control no-spinners" 
                  value={year}
                  onChange={(e) => {
                    // Only allow numeric input
                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                    setYear(numericValue);
                  }}
                  required
                  // Remove increment/decrement arrows
                  onKeyDown={(e) => {
                    if (['ArrowUp', 'ArrowDown', '+', '-', 'e', 'E', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label>Semester:</label>
                <select
                  className="form-select"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                >
                  <option value="">Select Semester</option>
                  {[...Array(8).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label>Panel Number:</label>
                <input
                  type="number"
                  className="form-control no-spinners"
                  value={panelNumber}
                  onChange={(e) => {
                    const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                    const numValue = parseInt(sanitizedValue || '0');
                    if (!isNaN(numValue)) {
                      setPanelNumber(numValue > 0 ? numValue : '');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  required
                />
                {filteredEvaluations.some(evaluation => 
                  evaluation.panelNumber === parseInt(panelNumber) && 
                  (!isEditing || evaluation._id !== editingEvaluationId)
                ) && (
                  <small className="text-danger">This panel number already exists for selected semester and year</small>
                )}
              </div>
            </div>

            {["chair", "evaluator2", "evaluator3"].map((role) => (
              <div key={role} className="mb-3">
                <label>{role.charAt(0).toUpperCase() + role.slice(1)}:</label>

                {!evaluators[role].isManual ? (
                  <Select
                    options={getFilteredFacultyList(role)}
                    isSearchable
                    placeholder={`Select ${role}`}
                    value={
                      evaluators[role].name
                        ? { value: evaluators[role].name, label: evaluators[role].name }
                        : null
                    }
                    onChange={(selectedOption) => handleFacultySelect(role, selectedOption)}
                    isDisabled={!year || !semester}
                    required
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Enter ${role} name manually`}
                    value={evaluators[role].name}
                    onChange={(e) => handleManualInputChange(role, "name", e.target.value)}
                    required
                  />
                )}

                <input
                  type="email"
                  className="form-control mt-2"
                  placeholder="Email"
                  value={evaluators[role].email}
                  readOnly={!evaluators[role].isManual}
                  onChange={(e) => handleManualInputChange(role, "email", e.target.value)}
                  required
                />

                {role !== "chair" && (
                  <div className="form-check mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`manualEntry-${role}`}
                      checked={evaluators[role].isManual}
                      onChange={() => handleManualToggle(role)}
                    />
                    <label className="form-check-label" htmlFor={`manualEntry-${role}`}>
                      Manual Entry (for External faculty)
                    </label>
                  </div>
                )}
              </div>
            ))}

            <div className="d-flex justify-content-between mt-3">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowForm(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleSave}
                disabled={isLoading || isSaveDisabled()}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {!showForm && !isLoading && (
          <div className="mt-4">
            <div className="mb-5">
              <div 
                className="d-flex justify-content-between align-items-center mb-3 cursor-pointer"
                onClick={() => toggleYearSection('currentYear')}
              >
                <h4 className="text-primary fw-bold text-center mb-0">
                  <i className="bi bi-journal-check"></i> Current Year ({new Date().getFullYear()}) Evaluations
                </h4>
                <i className={`bi bi-chevron-${expandedYears.currentYear ? 'up' : 'down'}`}></i>
              </div>

              {expandedYears.currentYear && (
                currentYearEvaluations.length > 0 ? (
                  <div className="row">
                    {currentYearEvaluations.map((evaluation, index) => (
                      <div key={index} className="col-md-6 col-lg-4 mb-4">
                        <div className="card border-0 shadow-lg rounded-4">
                          <div className="card-body text-center">
                            <h5 className="card-title text-secondary fw-semibold">
                              📋 Panel: {evaluation.panelNumber} | 📚 Semester: {evaluation.semester}
                            </h5>
                            <hr />

                            <div className="d-flex justify-content-between px-3">
                              <span className="badge bg-primary p-2 rounded-pill">
                                🎓 Chair: {evaluation.evaluators.chair.name}
                              </span>
                              <span className="badge bg-success p-2 rounded-pill">
                                🧑‍⚖️ Evaluator 2: {evaluation.evaluators.evaluator2.name}
                              </span>
                            </div>

                            <div className="mt-3">
                              <span className="badge text-white p-2 rounded-pill" style={{ backgroundColor: "#6f42c1" }}>
                                🧑‍⚖️ Evaluator 3: {evaluation.evaluators.evaluator3.name}
                              </span>
                            </div>

                            <button
                              className="btn btn-warning btn-sm mt-3"
                              onClick={() => handleEditEvaluation(evaluation)}
                              disabled={isLoading}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-warning text-center fw-semibold mt-3">
                    <i className="bi bi-exclamation-circle-fill"></i> No evaluations found for current year.
                  </div>
                )
              )}
            </div>

            <div className="mt-5">
              <div 
                className="d-flex justify-content-between align-items-center mb-3 cursor-pointer"
                onClick={() => toggleYearSection('previousYear')}
              >
                <h4 className="text-primary fw-bold text-center mb-0">
                  <i className="bi bi-journal-check"></i> Previous Year ({new Date().getFullYear() - 1}) Evaluations
                </h4>
                <i className={`bi bi-chevron-${expandedYears.previousYear ? 'up' : 'down'}`}></i>
              </div>

              {expandedYears.previousYear && (
                previousYearEvaluations.length > 0 ? (
                  <div className="row">
                    {previousYearEvaluations.map((evaluation, index) => (
                      <div key={index} className="col-md-6 col-lg-4 mb-4">
                        <div className="card border-0 shadow-lg rounded-4">
                          <div className="card-body text-center">
                            <h5 className="card-title text-secondary fw-semibold">
                              📋 Panel: {evaluation.panelNumber} | 📚 Semester: {evaluation.semester}
                            </h5>
                            <hr />

                            <div className="d-flex justify-content-between px-3">
                              <span className="badge bg-primary p-2 rounded-pill">
                                🎓 Chair: {evaluation.evaluators.chair.name}
                              </span>
                              <span className="badge bg-success p-2 rounded-pill">
                                🧑‍⚖️ Evaluator 2: {evaluation.evaluators.evaluator2.name}
                              </span>
                            </div>

                            <div className="mt-3">
                              <span className="badge text-white p-2 rounded-pill" style={{ backgroundColor: "#6f42c1" }}>
                                🧑‍⚖️ Evaluator 3: {evaluation.evaluators.evaluator3.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-warning text-center fw-semibold mt-3">
                    <i className="bi bi-exclamation-circle-fill"></i> No evaluations found for previous year.
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Evaluation;

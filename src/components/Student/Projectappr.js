import Sidebar from "./StudentSideBar";
import QuickMenu from "./QuickMenu";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../styles/AdminSidebar.css";

function ProjectAppr() {
  const [facultyList, setFacultyList] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [maxMembers, setMaxMembers] = useState(null);
  const [semester, setSemester] = useState(null);
  const [batch, setBatch] = useState(null);
  const [namee, setNamee] = useState(null);
  const [branch, setBranch] = useState(null);
  const [RollNumber, setRollNo] = useState(null);
  const [facultyLoadData, setFacultyLoadData] = useState(null);
  const [isFacultyLoadValid, setIsFacultyLoadValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [idd, setIdd] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(-1); // Track which dropdown is open
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRefs = useRef([]);

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.RollNumber.toString().includes(searchTerm)
  );

  const [formData, setFormData] = useState({
    Title: "",
    Content: "",
    Faculty: "",
  });

  const fetchExistingRequest = useCallback(async (id, semester) => {
    try {
      const response = await fetch(`https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/request/requests/${id}/${semester}`);
      if (response.ok) {
        const requestData = await response.json();
        if (requestData && (requestData.Status === "accepted" || requestData.Status === "pending")) {
          setExistingRequest(requestData);
        }
      }
    } catch (error) {
      console.error("Error fetching existing request:", error);
    }
  }, []);

  const fetchStudentData = useCallback(async (id) => {
    try {
      const response = await fetch(`https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/students/${id}`);
      if (response.ok) {
        const studentData = await response.json();
        setSemester(studentData.semester);
        setBatch(studentData.batch);
        setNamee(studentData.name);
        setRollNo(studentData.RollNumber);
        setBranch(studentData.branch);
        fetchExistingRequest(id, studentData.semester);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  }, [fetchExistingRequest]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const decodedToken = jwtDecode(token);
      const { id } = decodedToken;
      setIdd(id);
      fetchStudentData(id);
    }
  }, [fetchStudentData]);

  useEffect(() => {
    if (semester !== null && batch !== null) {
      fetchGroupData(semester);
      fetchStudentsBySemesterAndBatch(semester, batch);
    }
  }, [semester, batch]);

  const fetchGroupData = async (semester) => {
    try {
      const currentYear = new Date().getFullYear();
      const groupResponse = await fetch(
        `https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/groups?semester=${semester}&year=${currentYear}`
      );
      if (groupResponse.ok) {
        const groupData = await groupResponse.json();
        setMaxMembers(groupData[0].maxMembers || 0);
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
    }
  };

  const fetchStudentsBySemesterAndBatch = async (semester, batch) => {
    try {
      const response = await fetch(
        `https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/students/filter/by-semester-batch?semester=${semester}&batch=${batch}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        const activeStudentsRes = await fetch(
          `https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/request/activeStudents/${semester}/${batch}`
        );
        const { activeStudentIds } = await activeStudentsRes.json();
  
        const availableStudents = data.data.filter(
          student => !activeStudentIds.includes(student._id)
        );
  
        setStudents(availableStudents);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    getFaculty();
  }, []);

  const getFaculty = async () => {
    try {
      const response = await fetch("https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/faculty", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setFacultyList(data);
      }
    } catch (error) {
      console.error("Error fetching faculty data:", error);
    }
  };

  const fetchFacultyLoad = async (facultyId) => {
    setIsLoading(true);
    setIsFacultyLoadValid(false);
    setFacultyLoadData(null);

    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/facultyLoad?facultyId=${facultyId}&semester=${semester}&year=${currentYear}`
      );
      if (response.ok) {
        const facultyLoadData = await response.json();
        if (facultyLoadData.length > 0) {
          const { totalGroups, totalStudents, maxGroupsAllowed, maxStudentsAllowed } = facultyLoadData[0];
          setFacultyLoadData(facultyLoadData[0]);

          if (totalGroups < maxGroupsAllowed && totalStudents < (maxStudentsAllowed * maxGroupsAllowed)) {
            setIsFacultyLoadValid(true);
          } else {
            alert("Faculty member has reached their maximum load. Please select another faculty.");
          }
        } else {
          alert("Faculty load data not found.");
        }
      } else {
        alert("Error fetching faculty load data.");
      }
    } catch (error) {
      console.error("Error fetching faculty load data:", error);
      alert("An error occurred while fetching faculty load data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Faculty") {
      const selectedFaculty = facultyList.find(faculty => faculty._id === value);
      setFormData((prevData) => ({
        ...prevData,
        Faculty: value,
        facultyName: selectedFaculty ? selectedFaculty.name : "",
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const addTeamMember = () => {
    if (maxMembers === null) {
      alert("Max members limit is not set yet. Please wait.");
      return;
    }

    if (teamMembers.length >= maxMembers) {
      alert(`You can add up to ${maxMembers} members only.`);
      return;
    }

    if (teamMembers.length === 0) {
      setTeamMembers([
        {
          id: idd,
          name: namee,
          roll: RollNumber,
          branch: branch,
          isEditable: false,
        },
      ]);
    } else {
      setTeamMembers([...teamMembers, { id: "", name: "", roll: "", branch: "", isEditable: true }]);
    }
  };

  const downloadReport = async (requestId) => {
    try {
        // Open in new tab approach
        window.open(`https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/request/download-report/${requestId}`, '_blank');
    } catch (error) {
        console.error('Error downloading report:', error);
        alert('Error downloading report');
    }
};

  const handleStudentSelect = (student, index) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = {
      id: student._id,
      name: student.name,
      roll: student.RollNumber,
      branch: student.branch,
    };
    setTeamMembers(updatedMembers);
    setSearchTerm('');
    setDropdownOpenIndex(-1);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e, index) => {
    if (dropdownOpenIndex !== index) return;
    
    const filtered = filteredStudents.filter(student => 
      !teamMembers.some((tm, i) => i !== index && tm.id === student._id)
    );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      const student = filtered[focusedIndex];
      if (student) {
        handleStudentSelect(student, index);
      }
    } else if (e.key === 'Escape') {
      setDropdownOpenIndex(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedFaculty = facultyList.find(faculty => faculty._id === formData.Faculty);
      if (!selectedFaculty) {
        alert("Selected faculty not found. Please try again.");
        return;
      }
  
      const requestBody = {
        batch,
        teamMembers,
        semester,
        ...formData,
        facultyName: selectedFaculty.name,
        year: new Date().getFullYear(),
        Approved: false,
      };
  
      const response = await fetch("https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/request/createreq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        alert("Request submitted successfully!");
        setFormData({ Title: "", Content: "", Faculty: "" });
        setTeamMembers([]);
        window.location.reload();
      } else {
        alert("Failed to submit the request.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  return (
    <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{ width: "40rem", overflowY: "auto", padding: "20px" }}
      >
        <h4 className="m-5 mt-4 mb-1 text-success">Submit Project Request</h4>
        <div className="mx-4 mb-4 border-bottom border-3 rounded-5" />
        {existingRequest ? (
          <div className="p-4">
            <div className="p-4" style={{ backgroundColor: "#f0f8ff", borderRadius: "10px" }}>
              <div className="card-body">
                <h5 className="card-title text-primary">
                  <i className="bi bi-file-earmark-text me-2"></i>Existing Request Details
                </h5>
                <hr />
                <p>
                  <i className="bi bi-bookmark-fill text-success me-2"></i>
                  <strong>Title:</strong> {existingRequest.Title}
                </p>
                <p>
                  <i className="bi bi-card-text text-secondary me-2"></i>
                  <strong>Content:</strong> {existingRequest.Content}
                </p>
                <p>
                  <i className="bi bi-person-workspace text-info me-2"></i>
                  <strong>Faculty:</strong> {existingRequest.facultyName}
                </p>
                <p>
                  <i className="bi bi-clock text-warning me-2"></i>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge ${
                      existingRequest.Status === "accepted"
                        ? "bg-success"
                        : existingRequest.Status === "pending"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {existingRequest.Status.toUpperCase()}
                  </span>
                </p>

                <h6 className="mt-3">
                  <i className="bi bi-people-fill me-2"></i>Team Members:
                </h6>
                <ul className="list-group list-group-flush">
                  {existingRequest.teamMembers.map((member, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="bi bi-person-circle me-2"></i> {member.name} - {member.roll} ({member.branch})
                      </span>
                    </li>
                  ))}
                </ul>
                {existingRequest && (
                  <div className="mt-4 d-flex justify-content-end">
                    <button 
                      className="btn btn-primary"
                      onClick={() => downloadReport(existingRequest._id)}
                      disabled={!existingRequest.midTermEvaluated || !existingRequest.endTermEvaluated}
                    >
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      Download Evaluation Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form className="p-4 border rounded" onSubmit={handleSubmit}>
            {teamMembers.map((member, index) => (
              <div key={index} className="mb-3 position-relative">
                <label className="form-label">Team Member {index + 1}</label>
                {index === 0 ? (
                  <input
                    type="text"
                    className="form-control"
                    value={member.name}
                    readOnly
                  />
                ) : (
                  <div className="dropdown" ref={dropdownRef}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or roll number..."
                      value={member.id ? member.name : searchTerm}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (member.id && newValue !== member.name) {
                          const updatedMembers = [...teamMembers];
                          updatedMembers[index] = { 
                            id: "", 
                            name: newValue, 
                            roll: "", 
                            branch: "" 
                          };
                          setTeamMembers(updatedMembers);
                          setSearchTerm(newValue);
                        } else {
                          setSearchTerm(newValue);
                        }
                        setDropdownOpenIndex(index);
                        setFocusedIndex(-1);
                      }}
                      onFocus={() => {
                        setDropdownOpenIndex(index);
                        setFocusedIndex(-1);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      ref={el => inputRefs.current[index] = el}
                    />
                    {dropdownOpenIndex === index && (
                      <div 
                        className="dropdown-menu show w-100"
                        style={{ maxHeight: "200px", overflowY: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {filteredStudents
                          .filter(student => 
                            !teamMembers.some((tm, i) => i !== index && tm.id === student._id)
                          )
                          .map((student, studentIndex) => (
                            <button
                              key={student._id}
                              type="button"
                              className={`dropdown-item ${focusedIndex === studentIndex ? 'bg-primary text-white' : ''}`}
                              onClick={() => handleStudentSelect(student, index)}
                              onMouseEnter={() => setFocusedIndex(studentIndex)}
                            >
                              {student.name} (Roll: {student.RollNumber}) - {student.branch}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
                <label className="form-label">Team Member {index + 1} Roll</label>
                <input
                  type="text"
                  className="form-control"
                  value={member.roll}
                  readOnly
                />
                <label className="form-label">Team Member {index + 1} Branch</label>
                <input
                  type="text"
                  className="form-control"
                  value={member.branch}
                  readOnly
                />
              </div>
            ))}
            <button type="button" className="btn btn-outline-primary me-2 mb-2" onClick={addTeamMember}>
              Add Team Member
            </button>
            <div className="mb-3">
              <label className="form-label">Project Title</label>
              <input type="text" className="form-control" name="Title" value={formData.Title} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Project Content</label>
              <textarea className="form-control" name="Content" value={formData.Content} onChange={handleChange} required></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Select Faculty</label>
              <select
                className="form-select"
                name="Faculty"
                value={formData.Faculty}
                onChange={(e) => {
                  handleChange(e);
                  fetchFacultyLoad(e.target.value);
                }}
                required
              >
                <option value="">Choose...</option>
                {facultyList.map((faculty) => (
                  <option key={faculty._id} value={faculty._id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>
            {facultyLoadData && (
              <div className="mb-3">
                <p>Total Groups: {facultyLoadData.totalGroups} / {facultyLoadData.maxGroupsAllowed}</p>
              </div>
            )}
            {isLoading && (
              <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            <button 
              type="submit" 
              className="btn btn-success" 
              disabled={
                !isFacultyLoadValid || 
                isLoading || 
                teamMembers.length === 0 || 
                !formData.Title || 
                !formData.Content || 
                !formData.Faculty
              }
            >
              {isLoading ? "Loading..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
      <QuickMenu />
    </div>
  );
}

export default ProjectAppr;

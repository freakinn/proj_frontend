// import QuickMenu from './QuickMenu';
// import Sidebar from './FacultySideBar';
// import { useEffect, useState } from 'react';

// function ProjectReq() {
//   const [req, setReq] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [semester, setSemester] = useState(1);
//   const [year, setYear] = useState(new Date().getFullYear());

//   const getReq = async () => {
//     setIsLoading(true);
//     try {
//       const facultyId = localStorage.getItem("facultyId");
//       console.log("Fetching approved requests for faculty:", facultyId, "Semester:", semester, "Year:", year); // Debugging
//       const response = await fetch("https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/request/getapprovedreq", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           facultyId,
//           semester,
//           year
//         })
//       });
//       const data = await response.json();
//       console.log("Response data:", data); // Debugging
//       setReq(data);
//     } catch (error) {
//       console.error("Error fetching requests:", error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     getReq();
//   }, [semester, year]);

//   return (
//     <div className="d-flex">
//       {/* Sidebar */}
//       <div>
//         <Sidebar />
//       </div>

//       {/* Main Content */}
//       <div className="d-flex flex-column flex-grow-1" style={{ width: "40rem" }}>
//         <h4 className="m-5 mt-4 mb-1 text-success">Approved Project Requests</h4>
//         <div className="m-4 mb-4 border-bottom border-3 rounded-5" />

//         {/* Semester & Year Selection */}
//         <div className="m-4">
//           <label className="me-2">Select Semester:</label>
//           <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
//             {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
//               <option key={sem} value={sem}>{sem}</option>
//             ))}
//           </select>

//           <label className="ms-4 me-2">Select Year:</label>
//           <input 
//             type="number" 
//             value={year} 
//             onChange={(e) => setYear(Number(e.target.value))} 
//             min="2000" 
//             max={new Date().getFullYear()} 
//           />
//         </div>

//         {/* Render Requests */}
//         {isLoading ? (
//           <div className="d-flex justify-content-center">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         ) : req.length > 0 ? (
//           req.map((item, index) => (
//             <div key={item._id || index} className="mb-4 p-3 border rounded">
//               <h5 className="text-primary">{item.Title}</h5>
//               <p className="mb-1">{item.Content}</p>
//               <p className="mb-1">
//                 <strong>Faculty:</strong> {item.Faculty}
//               </p>
//               <p className="mb-1">
//                 <strong>Team Members:</strong>
//                 <ul>
//                   {item.teamMembers.map((member, index) => (
//                     <li key={index}>
//                       {member.name} (Roll: {member.roll})
//                     </li>
//                   ))}
//                 </ul>
//               </p>
//               <p className="mb-1">
//                 <strong>Approved:</strong> {item.Approved ? "Yes" : "No"}
//               </p>
//             </div>
//           ))
//         ) : (
//           <p className="text-muted">No approved requests found.</p>
//         )}
//       </div>

//       {/* Quick Menu */}
//       <div className="flex-grow-1 border-start border-3" style={{ width: "5rem" }}>
//         <QuickMenu />
//       </div>
//     </div>
//   );
// }

// export default ProjectReq;
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import QuickMenu from "./QuickMenu";
import Sidebar from "./FacultySideBar";

function ProjectReq() {
    const currentYear = new Date().getFullYear();
    const pastYears = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const [req, setReq] = useState([]);
    const [userName, setUserName] = useState("");
    const [facultyId, setFacultyId] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [searchTerm, setSearchTerm] = useState("");  
    const [semesterError, setSemesterError] = useState(false); // 🔹 State to track semester validation

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            const decodedToken = jwtDecode(token);
            const { id } = decodedToken;

            setFacultyId(id);
            fetchFacultyData(id);
        }
    }, []);

    useEffect(() => {
        if (facultyId && selectedSemester) {
            fetchApprovedRequests(facultyId, selectedSemester, selectedYear);
        }
    }, [facultyId, selectedSemester, selectedYear]);

    const fetchApprovedRequests = async (facultyId, semester, year) => {
        console.log("Fetching approved requests with:", { facultyId, semester, year });
        try {
            const response = await fetch("https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/request/getapprovedreq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ facultyId, semester, year })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch approved requests");
            }

            const data = await response.json();
            console.log("Fetched data:", data);
            setReq(data);
        } catch (error) {
            console.error("Error fetching approved requests:", error);
        }
    };

    const fetchFacultyData = async (id) => {
        try {
            const response = await fetch(`https://proj-backend-r0kpxc46e-freakinns-projects.vercel.app/api/faculty/${id}`);
            if (response.ok) {
                const facultyData = await response.json();
                setUserName(facultyData.name);
            } else {
                console.error("Failed to fetch faculty data");
            }
        } catch (error) {
            console.error("Error fetching faculty data:", error.message);
        }
    };

    // 🔹 Filter requests based on search term
    const filteredRequests = req.filter((item) =>
        item.Title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 🔹 Handle Semester Selection & Clear Error
    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
        if (e.target.value) {
            setSemesterError(false); // Remove error when semester is selected
        }
    };

    // 🔹 Handle Search Click (Validate Semester Selection)
    const handleSearchChange = (e) => {
        if (!selectedSemester) {
            setSemesterError(true);
        } else {
            setSearchTerm(e.target.value);
        }
    };

    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="d-flex flex-column flex-grow-1 p-4">
                <h4 className="m-4 mt-3 text-success fw-bold">Approved Requests</h4>
                <div className="mx-4 mb-4 border-bottom border-3 rounded-5" />

                {/* 🔹 Semester & Year Dropdowns */}
                <div className="d-flex mb-3">
                    <div className="me-2 w-50">
                        <select className={`form-select ${semesterError ? "border-danger" : ""}`} onChange={handleSemesterChange}>
                            <option value="">Select Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
                        </select>
                        {semesterError && <small className="text-danger">This field is required</small>}
                    </div>

                    <select className="form-select w-50" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                        {pastYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* 🔹 Search Bar (Disabled Until Semester is Selected) */}
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Project Title..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        disabled={!selectedSemester} // 🔹 Disable search bar if semester is not selected
                    />
                </div>

                {/* Display Filtered Requests */}
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((item, index) => (
                        <div key={item._id || index} className="mb-4 p-4 border rounded shadow-sm">
                            <h5 className="text-primary">{item.Title}</h5>
                            <p className="mb-1">{item.Content}</p>
                            <p className="mb-1"><strong>Faculty:</strong> {userName}</p>
                            <p className="mb-1"><strong>Team Members:</strong></p>
                            <ul className="ps-3">
                                {item.teamMembers.map((member, i) => (
                                    <li key={i}>{member.name} (Roll No: {member.roll}) - {member.branch}</li>
                                ))}
                            </ul>
                            <p className="mb-1"><strong>Status:</strong> <span className="text-success fw-bold">{item.Status}</span></p>
                        </div>
                    ))
                ) : (
                    <p className="text-muted text-center">No approved requests found.</p>
                )}
            </div>

            {/* Quick Menu */}
            <div className="flex-grow-1 border-start border-3" style={{ width: "5rem" }}>
                <QuickMenu />
            </div>
        </div>
    );
}

export default ProjectReq;

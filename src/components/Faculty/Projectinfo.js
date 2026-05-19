import QuickMenu from './QuickMenu';
import Sidebar from './FacultySideBar';
import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";

function Projectinfo() {
    const [req, setReq] = useState([]);
    const [userName, setUserName] = useState("");
    const [facultyId, setFacultyId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            const decodedToken = jwtDecode(token);
            const { id } = decodedToken;

            fetchPendingRequests(id); // Fetch requests using faculty ID
            fetchFacultyData(id); // Fetch faculty data using faculty ID
            setFacultyId(id); // Set faculty ID
        }
    }, []); // Empty dependency array ensures this runs once on component mount

    const handleStatusUpdate = async (idd, status) => {
        try {
            var temp = false;
            if(status === "accepted"){
                temp = true;
            }
            const response = await fetch("http://localhost:5173/api/request/updateStatus", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ requestId: idd, status, temp })
            });

            if (response.ok) {
                setReq((prevReq) =>
                    prevReq.map((item) =>
                        item._id === idd ? { ...item, Status: status } : item
                    )
                );
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const fetchFacultyData = async (id) => {
        try {
            const response = await fetch(`http://localhost:5173/api/faculty/${id}`);
            if (response.ok) {
                const facultyData = await response.json();
                setUserName(facultyData.name);
            } else {
                console.error('Failed to fetch faculty data');
            }
        } catch (error) {
            console.error('Error fetching faculty data:', error.message);
        }
    };

    const fetchPendingRequests = async (facultyId) => {
        try {
            const response = await fetch("http://localhost:5173/api/request/getPendingRequests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ facultyId })
            });
    
            if (!response.ok) {
                throw new Error("Failed to fetch pending requests");
            }
    
            const data = await response.json();
            setReq(data);
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        }
    };

    const fetchFacultyLoad = async (teamSize, semm) => {
        console.log(semm);
        try {
            const currentYear = new Date().getFullYear();
            const response = await fetch(
                `http://localhost:5173/api/facultyLoad?facultyId=${facultyId}&semester=${semm}&year=${currentYear}`
            );
    
            if (response.ok) {
                const facultyLoadData = await response.json();
                if (facultyLoadData.length > 0) {
                    // Call the update function after fetching faculty load
                    await updateFacultyLoad(teamSize, semm);
                } else {
                    alert("Faculty load data not found.");
                }
            } else {
                alert("Error fetching faculty load data.");
            }
        } catch (error) {
            console.error("Error fetching faculty load data:", error);
            alert("An error occurred while fetching faculty load data.");
        }
    };

    // Function to update faculty load
    const updateFacultyLoad = async (teamSize, semester) => {
        console.log('facultyId:', facultyId); // Ensure facultyId is defined in your scope
        try {
            const currentYear = new Date().getFullYear();
            const response = await fetch("http://localhost:5173/api/facultyLoad/update-faculty-stats", {
                method: "PUT", // Change to PUT
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    facultyId, // Ensure facultyId is defined
                    year: currentYear,
                    semester, // Renamed from semm to semester
                    value: teamSize, // Renamed from teamSize to value
                }),
            });
    
            if (response.ok) {
                console.log("Faculty load updated successfully.");
            } else {
                console.error("Error updating faculty load.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleAccept = async (requestId, semester, teamSize) => {
        try {
            // 1. Find the full request details first
            const request = req.find(r => r._id === requestId);
            if (!request) throw new Error("Request not found");
    
            // 2. Get current count of accepted projects
            const countResponse = await fetch("http://localhost:5173/api/request/getAcceptedCount", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    semester: Number(request.semester),
                    batch: Number(request.batch)
                })
            });
    
            if (!countResponse.ok) {
                const errorData = await countResponse.json();
                throw new Error(errorData.message || "Failed to get group count");
            }
            
            const { count } = await countResponse.json();
            const newGroupNo = count + 1;
    
            // 3. Update status and set GroupNo
            const updateResponse = await fetch("http://localhost:5173/api/request/updateStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    requestId,
                    status: "accepted",
                    temp: true,
                    groupNo: newGroupNo
                })
            });
    
            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData.message || "Failed to update status");
            }
    
            // 4. Update local state
            setReq(prevReq =>
                prevReq.map(reqItem =>
                    reqItem._id === requestId 
                        ? { ...reqItem, Status: "accepted", GroupNo: newGroupNo }
                        : reqItem
                )
            );
            
            // 5. Update faculty load
            await fetchFacultyLoad(teamSize, semester);
    
        } catch (error) {
            console.error("Error in handleAccept:", error);
            alert(`Error accepting project: ${error.message}`);
        }
    };

    return (
    //     <div className="d-flex">
    //         {/* Sidebar */}
    //         <div>
    //             <Sidebar />
    //         </div>

    //         {/* Main Content */}
    //         <div className="d-flex flex-column flex-grow-1" style={{ width: "40rem" }}>
    //             <h4 className="m-5 mt-4 mb-1 text-success">Manage Profile</h4>
    //             <div className="m-4 mb-4 border-bottom border-3 rounded-5" />

    //             {req.length > 0 ? (
    //                 req.map((item, index) => (
    //                     <div key={item._id || index} className="mb-4 p-3 border rounded">
    //                         <h5 className="text-primary">{item.Title}</h5>
    //                         <p className="mb-1">{item.Content}</p>
    //                         <p className="mb-1">
    //                             <strong>Faculty:</strong> {userName}
    //                         </p>
    //                         <p className="mb-1">
    //                             <strong>Team Members:</strong>
    //                         </p>
    //                         <ul>
    //                             {item.teamMembers.map((member, i) => (
    //                                 <li key={i}>
    //                                     {member.name} (Roll No: {member.roll}) - {member.branch}
    //                                 </li>
    //                             ))}
    //                         </ul>
    //                         <p className="mb-1">
    //                             <strong>Status:</strong> {item.Status}
    //                         </p>

    //                         {item.Status === "pending" && (
    //                             <div>
    //                                 <button
    //                                     className="btn btn-success mt-2 me-2"
    //                                     onClick={() => handleAccept(item._id,item.semester,item.teamMembers.length)}
    //                                 >
    //                                     Accept
    //                                 </button>
    //                                 <button
    //                                     className="btn btn-danger mt-2"
    //                                     onClick={() => handleStatusUpdate(item._id, "rejected")}
    //                                 >
    //                                     Reject
    //                                 </button>
    //                             </div>
    //                         )}
    //                     </div>
    //                 ))
    //             ) : (
    //                 <p className="text-muted">No requests found.</p>
    //             )}
    //         </div>

    //         {/* Quick Menu */}
    //         <div className="flex-grow-1 border-start border-3" style={{ width: "5rem" }}>
    //             <QuickMenu />
    //         </div>
    //     </div>
    // );
    <div className="d-flex">
    {/* Sidebar */}
    <div>
        <Sidebar />
    </div>

    {/* Main Content */}
    <div 
        className="d-flex flex-column flex-grow-1 p-4"
        style={{ 
            width: "40rem",
            background: "linear-gradient(to right, #f8f9fa, #e3f2fd)", // Soft gradient background
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
        }}
    >
        <h4 className="m-4 mt-3 text-success fw-bold">Manage Profile</h4>
        <div className="mx-4 mb-4 border-bottom border-3 rounded-5" />

        {req.length > 0 ? (
            req.map((item, index) => (
                <div 
                    key={item._id || index} 
                    className="mb-4 p-4 border rounded shadow-sm"
                    style={{ 
                        backgroundColor: "#ffffff", // Clean white card
                        borderRadius: "10px",
                        transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)"; }}
                >
                    <h5 className="text-primary">{item.Title}</h5>
                    <p className="mb-1">{item.Content}</p>
                    <p className="mb-1">
                        <strong>Faculty:</strong> {userName}
                    </p>
                    <p className="mb-1">
                        <strong>Team Members:</strong>
                    </p>
                    <ul className="ps-3">
                        {item.teamMembers.map((member, i) => (
                            <li key={i} className="text-dark">
                                {member.name} (Roll No: {member.roll}) - {member.branch}
                            </li>
                        ))}
                    </ul>
                    <p className="mb-1">
                        <strong>Status:</strong> <span className={item.Status === "pending" ? "text-warning fw-bold" : "text-success fw-bold"}>{item.Status}</span>
                    </p>

                    {item.Status === "pending" && (
                        <div>
                            <button
                                className="btn btn-success mt-2 me-2 px-3"
                                onClick={() => handleAccept(item._id, item.semester, item.teamMembers.length)}
                            >
                                Accept
                            </button>
                            <button
                                className="btn btn-danger mt-2 px-3"
                                onClick={() => handleStatusUpdate(item._id, "rejected")}
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            ))
        ) : (
            <p className="text-muted text-center">No requests found.</p>
        )}
    </div>

    {/* Quick Menu */}
    <div className="flex-grow-1 border-start border-3" style={{ width: "5rem" }}>
        <QuickMenu />
    </div>
</div>
    )
}

export default Projectinfo;

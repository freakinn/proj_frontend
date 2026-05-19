// import React, { useState } from "react";
// import { Collapse, Form, Button, Card } from "react-bootstrap";

// function ManageGroupsBody() {
//   const currentYear = new Date().getFullYear();
//   const [groupSettings, setGroupSettings] = useState([]);
//   const [semester, setSemester] = useState("");
//   const [maxGroups, setMaxGroups] = useState("");
//   const [maxMembers, setMaxMembers] = useState("");
//   const [openWindow, setOpenWindow] = useState(false);
//   const [deadline, setDeadline] = useState("");
//   const [year, setYear] = useState(currentYear);
//   const [editIndex, setEditIndex] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   const handleSave = () => {
//     const newSettings = {
//       semester,
//       maxGroups,
//       maxMembers,
//       openWindow,
//       deadline,
//       year,
//     };

//     if (editIndex !== null) {
//       const updatedSettings = [...groupSettings];
//       updatedSettings[editIndex] = newSettings;
//       setGroupSettings(updatedSettings);
//       setEditIndex(null);
//     } else {
//       setGroupSettings([...groupSettings, newSettings]);
//     }

//     resetFields();
//     setShowForm(false);
//   };

//   const resetFields = () => {
//     setSemester("");
//     setMaxGroups("");
//     setMaxMembers("");
//     setOpenWindow(false);
//     setDeadline("");
//     setYear(currentYear);
//   };

//   const handleEdit = (index) => {
//     const settings = groupSettings[index];
//     setSemester(settings.semester);
//     setMaxGroups(settings.maxGroups);
//     setMaxMembers(settings.maxMembers);
//     setOpenWindow(settings.openWindow);
//     setDeadline(settings.deadline);
//     setYear(settings.year);
//     setEditIndex(index);
//     setShowForm(true);
//   };

//   const handleDelete = (index) => {
//     if (window.confirm("Are you sure you want to delete this setting?")) {
//       setGroupSettings(groupSettings.filter((_, i) => i !== index));
//     }
//   };

//   const handleAddDetails = () => {
//     resetFields();
//     setEditIndex(null);
//     setShowForm(true);
//   };

//   return (
//     <div className="container mt-4">
//       <h4 className="text-success mb-4">Manage Group Settings</h4>
//       <Button
//         className="mb-4"
//         variant="primary"
//         onClick={handleAddDetails}
//         style={{
//           fontFamily: 'Arial, sans-serif',
//           fontSize: '16px',
//           fontWeight: 'bold',
//           letterSpacing: '1px',
//           textTransform: 'uppercase'
//         }}
//         >
//           Add Details
//         </Button>


//       {showForm && (
//         <Card className="p-4 shadow rounded">
//           <Form>
//             <Form.Group controlId="semester">
//               <Form.Label>Semester</Form.Label>
//               <Form.Control
//                 as="select"
//                 value={semester}
//                 onChange={(e) => setSemester(e.target.value)}
//               >
//                 <option value="">Select Semester</option>
//                 {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
//                   <option key={sem} value={sem}>
//                     {sem}
//                   </option>
//                 ))}
//               </Form.Control>
//             </Form.Group>

//             <Form.Group controlId="year" className="mt-3">
//               <Form.Label>Year</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={year}
//                 onChange={(e) => setYear(e.target.value)}
//                 placeholder="Enter Year"
//               />
//             </Form.Group>

//             <Form.Group controlId="maxGroups" className="mt-3">
//               <Form.Label>Maximum Groups</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={maxGroups}
//                 onChange={(e) => setMaxGroups(e.target.value)}
//                 placeholder="Enter maximum groups"
//               />
//             </Form.Group>

//             <Form.Group controlId="maxMembers" className="mt-3">
//               <Form.Label>Maximum Members per Group</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={maxMembers}
//                 onChange={(e) => setMaxMembers(e.target.value)}
//                 placeholder="Enter maximum members"
//               />
//             </Form.Group>

//             <Form.Group controlId="openWindow" className="mt-3">
//               <Form.Check
//                 type="checkbox"
//                 label="Open Window"
//                 checked={openWindow}
//                 onChange={(e) => setOpenWindow(e.target.checked)}
//               />
//             </Form.Group>

//             <Form.Group controlId="deadline" className="mt-3">
//               <Form.Label>Deadline</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={deadline}
//                 onChange={(e) => setDeadline(e.target.value)}
//               />
//             </Form.Group>

//             <Button
//               className="mt-4"
//               variant="success"
//               onClick={handleSave}
//               disabled={!semester || !maxGroups || !maxMembers || !year || !deadline}
//             >
//               {editIndex !== null ? "Update" : "Save"}
//             </Button>
//           </Form>
//         </Card>
//       )}

//       <div className="mt-5">
//         {groupSettings.map((settings, index) => (
//           <Card key={index} className="mb-3 shadow">
//             <Card.Header className="d-flex justify-content-between align-items-center">
//               <div>
//                 Group Settings - Sem-{settings.semester} Year-{settings.year}
//               </div>
//               <div>
//                 <Button
//                   variant="primary"
//                   className="me-2"
//                   onClick={() => handleEdit(index)}
//                 >
//                   Edit
//                 </Button>
//                 <Button
//                   variant="danger"
//                   onClick={() => handleDelete(index)}
//                 >
//                   Delete
//                 </Button>
//               </div>
//             </Card.Header>
//             <Collapse in={true}>
//               <Card.Body>
//                 <p>Maximum Groups: {settings.maxGroups}</p>
//                 <p>Maximum Members: {settings.maxMembers}</p>
//                 <p>Open Window: {settings.openWindow ? "Yes" : "No"}</p>
//                 <p>Deadline: {settings.deadline}</p>
//               </Card.Body>
//             </Collapse>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default ManageGroupsBody;

//-----

import React, { useState, useEffect } from "react";
import { Collapse, Form, Button, Card } from "react-bootstrap";
import axios from "axios"; // Import axios for API calls

function ManageGroupsBody() {
  const currentYear = new Date().getFullYear();
  const [groupSettings, setGroupSettings] = useState([]);
  const [semester, setSemester] = useState("");
  const [maxGroups, setMaxGroups] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [openWindow, setOpenWindow] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [year, setYear] = useState(currentYear);
  const [editIndex, setEditIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch group settings when the component loads
  useEffect(() => {
    fetchGroupSettings();
  }, []);

  const fetchGroupSettings = async () => {
    try {
      const response = await axios.get("http://localhost:5173/api/groups");
      setGroupSettings(response.data);
    } catch (error) {
      console.error("Error fetching group settings:", error);
    }
  };

  const handleSave = async () => {
    const newSettings = {
      semester,
      maxGroups,
      maxMembers,
      openWindow,
      deadline,
      year,
    };

    try {
      if (editIndex !== null) {
        // Update existing group setting
        await axios.put(`http://localhost:5173/api/groups/${groupSettings[editIndex]._id}`, newSettings);
      } else {
        // Save new group setting
        await axios.post("http://localhost:5173/api/groups", newSettings);
      }

      // Refresh the group settings list after saving
      fetchGroupSettings();
      resetFields();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving group settings:", error);
    }
  };

  const handleEdit = (index) => {
    const settings = groupSettings[index];
    setSemester(settings.semester);
    setMaxGroups(settings.maxGroups);
    setMaxMembers(settings.maxMembers);
    setOpenWindow(settings.openWindow);
    setDeadline(settings.deadline);
    setYear(settings.year);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this setting?")) {
      const id = groupSettings[index]._id;
      try {
        await axios.delete(`http://localhost:5173/api/groups/${id}`);
        fetchGroupSettings(); // Refresh list after deletion
      } catch (error) {
        console.error("Error deleting group setting:", error);
      }
    }
  };

  const handleAddDetails = () => {
    resetFields();
    setEditIndex(null);
    setShowForm(true);
  };

  const resetFields = () => {
    setSemester("");
    setMaxGroups("");
    setMaxMembers("");
    setOpenWindow(false);
    setDeadline("");
    setYear(currentYear);
  };

  return (
    <div className="container mt-4">
      <Button
        className="mb-4"
        variant="primary"
        onClick={handleAddDetails}
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          fontWeight: "bold",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Add Details
      </Button>

      {showForm && (
        <Card className="p-4 shadow rounded">
          <Form>
            <Form.Group controlId="semester">
              <Form.Label>Semester</Form.Label>
              <Form.Control
                as="select"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="year" className="mt-3">
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Enter Year"
              />
            </Form.Group>

            <Form.Group controlId="maxGroups" className="mt-3">
              <Form.Label>Maximum Groups</Form.Label>
              <Form.Control
                type="text" // Use type="text" instead of type="number"
                value={maxGroups}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) { // Allow only numeric input
                    setMaxGroups(value);
                  }
                }}
                placeholder="Enter maximum groups"
                inputMode="numeric" // Ensures numeric keyboard on mobile devices
              />
            </Form.Group>

            <Form.Group controlId="maxMembers" className="mt-3">
              <Form.Label>Maximum Members per Group</Form.Label>
              <Form.Control
                type="text" // Use type="text" instead of type="number"
                value={maxMembers}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) { // Allow only numeric input
                    setMaxMembers(value);
                  }
                }}
                placeholder="Enter maximum members"
                inputMode="numeric" // Ensures numeric keyboard on mobile devices
              />
            </Form.Group>

            <Form.Group controlId="openWindow" className="mt-3">
              <Form.Check
                type="checkbox"
                label="Open Window"
                checked={openWindow}
                onChange={(e) => setOpenWindow(e.target.checked)}
              />
            </Form.Group>

            <Form.Group controlId="deadline" className="mt-3">
              <Form.Label>Deadline</Form.Label>
              <Form.Control
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </Form.Group>

            <Button
              className="mt-4"
              variant="success"
              onClick={handleSave}
              disabled={!semester || !maxGroups || !maxMembers || !year || !deadline}
            >
              {editIndex !== null ? "Update" : "Save"}
            </Button>
          </Form>
        </Card>
      )}

      <div className="mt-5">
        {groupSettings.map((settings, index) => (
          <Card key={index} className="mb-3 shadow">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                Group Settings - Sem-{settings.semester} Year-{settings.year}
              </div>
              <div>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </Button>
              </div>
            </Card.Header>
            <Collapse in={true}>
              <Card.Body>
                <p>Maximum Groups: {settings.maxGroups}</p>
                <p>Maximum Members: {settings.maxMembers}</p>
                <p>Open Window: {settings.openWindow ? "Yes" : "No"}</p>
                <p>Deadline: {settings.deadline}</p>
              </Card.Body>
            </Collapse>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ManageGroupsBody;

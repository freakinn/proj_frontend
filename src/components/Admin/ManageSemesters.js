import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button } from 'react-bootstrap';

function ManageSemesters() {
    const [semesterSettings, setSemesterSettings] = useState([
        { semester: 1, maxGroups: '', maxStudents: '' },
        { semester: 2, maxGroups: '', maxStudents: '' },
        { semester: 3, maxGroups: '', maxStudents: '' },
        { semester: 4, maxGroups: '', maxStudents: '' },
    ]);

    const navigate = useNavigate();

    const handleInputChange = (semesterIndex, field, value) => {
        const updatedSettings = [...semesterSettings];
        updatedSettings[semesterIndex][field] = value;
        setSemesterSettings(updatedSettings);
    };

    const handleSave = () => {
        // Add your logic to save the settings to the database or backend here
        console.log('Saved settings:', semesterSettings);

        // Redirect to the previous route
        
        navigate('/admin/dashboard/manage-students');
    };

    return (
        <div className="d-flex flex-column align-items-center mt-4">
            <h3 className="mb-4 text-success">Manage Semester Settings</h3>

            <div className="d-flex flex-wrap justify-content-center gap-4">
                {semesterSettings.map((settings, index) => (
                    <Card key={index} className="p-4 shadow" style={{ width: '20rem' }}>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">Semester {settings.semester}</Card.Title>

                            <Form.Group className="mb-3">
                                <Form.Label>Max Groups per Faculty</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter max groups"
                                    value={settings.maxGroups}
                                    onChange={(e) => handleInputChange(index, 'maxGroups', e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Max Students per Group</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter max students"
                                    value={settings.maxStudents}
                                    onChange={(e) => handleInputChange(index, 'maxStudents', e.target.value)}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            <Button className="mt-4" variant="success" onClick={handleSave}>
                Save
            </Button>
        </div>
    );
}

export default ManageSemesters; // Add this component as a route in your App.js

import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Card from "react-bootstrap/Card";
import Form from 'react-bootstrap/Form';
import AddStudentImage from "../../assets/AddStudentImage.png";
import DeleteImage from "../../assets/DeleteImage.png";
import "../../styles/Effects.css";
import NotificationToast from '../NotificationToast';
import UploadCSVImage from "../../assets/UploadCSVImage.png";
import AddStudentModal from './modals/AddStudentModal';
import RemoveStudentModal from './modals/RemoveStudentModal';
import UpdateStudentModal from './modals/UpdateStudentModal';

function ManageStudentsBody() {
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [showUpdateStudentModal, setShowUpdateStudentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [message, setMessage] = useState('');
    const [modalUpdated, setModalUpdated] = useState(false);

    const handleShowToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleShowAddStudentModal = () => setShowAddStudentModal(true);
    const handleCloseAddStudentModal = () => {
        setShowAddStudentModal(false);
        setModalUpdated(!modalUpdated);
    }
    const handleShowRemoveStudentModal = () => setShowRemoveStudentModal(true);
    const handleCloseRemoveStudentModal = () => {
        setShowRemoveStudentModal(false);
        setModalUpdated(!modalUpdated);
    }
    const handleShowUpdateStudentModal = (student) => {
        setSelectedStudent(student);
        setShowUpdateStudentModal(true);
    };
    const handleCloseUpdateStudentModal = () => {
        setShowUpdateStudentModal(false);
        setModalUpdated(!modalUpdated);
    }

    const handleUploadCSV = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
    
        if (!file) {
            setMessage('No file selected. Please choose a CSV file.');
            handleShowToast();
            return;
        }
    
        // Validate file type
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setMessage('Invalid file type. Please upload a CSV file.');
            handleShowToast();
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await fetch('http://localhost:5173/api/uploadStudents', {
                method: 'POST',
                body: formData,
            });            
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload CSV file.');
            }
    
            const result = await response.json();
            console.log('Upload successful:', result);
            setMessage('Students uploaded successfully!');
            handleShowToast();
            setModalUpdated(!modalUpdated); // Trigger data refresh
        } catch (error) {
            console.error('Error uploading CSV:', error);
            setMessage(error.message || 'Error uploading students. Please try again.');
            handleShowToast();
        }
    };

    const handleSearchChange = (e) => {
        setSearchEmail(e.target.value);
    };

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch("http://localhost:5173/api/students");
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStudents();
    }, [modalUpdated]);

    useEffect(() => {
        const filtered = students.filter(student => student.email.includes(searchEmail));
        setFilteredStudents(filtered);
    }, [searchEmail, students]);

    return (
        <div className="d-flex justify-content-center">
            <div>
                <div className="d-flex mx-5">
                    <Card
                        className="m-3 p-3 shadow align-items-center pe-auto"
                        style={{ width: "13rem" }}
                        onMouseEnter={(e) => e.target.classList.add('shadow-lg')}
                        onMouseLeave={(e) => e.target.classList.remove('shadow-lg')}
                    >
                        <label htmlFor="uploadCSV">
                            <Card.Img
                                className="p-0"
                                variant="top"
                                src={UploadCSVImage}
                                style={{ width: "5rem", height: "5rem", cursor: 'pointer' }}
                            />
                            <Card.Body className="d-flex align-items-center">
                                <div>
                                    <Card.Title>Upload Students</Card.Title>
                                </div>
                            </Card.Body>
                        </label>
                        <input
                            type="file"
                            id="uploadCSV"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={handleUploadCSV}
                        />
                    </Card>

                    <Card
                        className="m-3 p-3 shadow align-items-center pe-auto"
                        style={{ width: "18rem" }}
                        onMouseEnter={(e) => e.target.classList.add('shadow-lg')}
                        onMouseLeave={(e) => e.target.classList.remove('shadow-lg')}
                        onClick={handleShowAddStudentModal}
                        role='button'
                    >
                        <Card.Img
                            className="p-0"
                            variant="top"
                            src={AddStudentImage}
                            style={{ width: "5rem", height: "5rem" }}
                        />
                        <Card.Body className="d-flex align-items-center">
                            <div>
                                <Card.Title>Add Student</Card.Title>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card
                        className="m-3 mx-5 p-3 shadow align-items-center"
                        style={{ width: "13rem" }}
                        onMouseEnter={(e) => e.target.classList.add('shadow-lg')}
                        onMouseLeave={(e) => e.target.classList.remove('shadow-lg')}
                        role='button'
                        onClick={handleShowRemoveStudentModal}
                    >
                        <Card.Img
                            className="p-0 rounded-circle"
                            variant="top"
                            src={DeleteImage}
                            style={{ width: "5rem", height: "5rem" }}
                        />
                        <Card.Body className="d-flex align-items-center">
                            <div>
                                <Card.Title>Remove Student</Card.Title>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                <div className="mt-4 mx-5 p-4 pt-3 border border-3 border-success rounded-4" style={{ width: "42rem" }}>
                    <Form>
                        <Form.Group controlId="searchEmail">
                            <Form.Label>Search by Email</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type="email"
                                    placeholder="Enter student's email"
                                    value={searchEmail}
                                    onChange={handleSearchChange}
                                />
                                <button className="btn btn-success" type="button">Search</button>
                            </div>
                        </Form.Group>
                    </Form>

                    <div className='mt-3 border border-2 rounded-2 '>
                        <div className="d-flex w-100">
                            <Col xs={3} className="p-3 px-4 fw-bold">Name</Col>
                            <Col xs={4} className="p-3 px-0 fw-bold">Email</Col>
                        </div>
                        <hr className="text-black m-0" />
                        <div className="scrollable-container" style={{ height: '160px', overflowY: 'auto' }}>
                            {filteredStudents
                                .sort((a, b) => a.email.localeCompare(b.email))
                                .map(student => (
                                    <div
                                        className='d-flex bg-hover-div'
                                        key={student._id}
                                        role='button'
                                        onClick={() => handleShowUpdateStudentModal(student)}
                                    >
                                        <Row className="w-100">
                                            <Col xs={3} className="p-4">
                                                <p className="px-3 mb-0 fw-bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</p>
                                            </Col>
                                            <Col xs={4} className="pt-3">
                                                <p className="mb-0 text-muted overflow-auto">{student.email}</p>
                                            </Col>
                                            <Col xs={2} className="px-4 pt-4 ">
                                                <i className="bi bi-pencil-square"> Edit</i>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                <AddStudentModal show={showAddStudentModal} handleClose={handleCloseAddStudentModal} setMessage={setMessage} handleShowToast={handleShowToast} />
                <RemoveStudentModal show={showRemoveStudentModal} handleClose={handleCloseRemoveStudentModal} setMessage={setMessage} handleShowToast={handleShowToast} />
                <UpdateStudentModal show={showUpdateStudentModal} handleClose={handleCloseUpdateStudentModal} student={selectedStudent} setMessage={setMessage} handleShowToast={handleShowToast} />
                <NotificationToast show={showToast} setShow={setShowToast} message={message} />
            </div>
        </div>
    )
}

export default ManageStudentsBody;

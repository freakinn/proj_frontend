import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';

function UpdateStudentModal({ show, handleClose, student, setMessage, handleShowToast }) {
    const [validated, setValidated] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [RollNumber, setRollNo] = useState('');
    const [batch, setBatch] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [branch, setBranch] = useState('');
    const [semester, setSemester] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (student) {
            setName(student.name || '');
            setEmail(student.email || '');
            setPassword(student.password || '');
            setRollNo(student.RollNumber || '');
            setBatch(student.batch || '');
            setAcademicYear(student.academicYear || '');
            setBranch(student.branch || '');
            setSemester(student.semester || '');
        }
    }, [student]);

    const handleNameChange = (e) => setName(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleRollNoChange = (e) => setRollNo(e.target.value);
    const handleBatchChange = (e) => setBatch(e.target.value);
    const handleAcademicYearChange = (e) => setAcademicYear(e.target.value);
    const handleBranchChange = (e) => setBranch(e.target.value);
    const handleSemesterChange = (e) => setSemester(e.target.value);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
        }
        setValidated(true);
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:5173/api/students/${student._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    RollNumber,
                    batch,
                    academicYear,
                    branch,
                    semester,
                }),
            });

            setLoading(false);

            if (!response.ok) {
                setMessage('Failed to update student');
                handleShowToast();
                handleClose();
                setValidated(false);
            } else {
                setMessage('Student updated successfully');
                handleShowToast();
                handleClose();
                setValidated(false);
            }
        } catch (error) {
            console.error('Error updating student:', error);
            setMessage('Failed to update student');
            handleShowToast();
            handleClose();
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Update Student</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body className="px-5 py-4">
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom01">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter student's name"
                                value={name}
                                onChange={handleNameChange}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom02">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                required
                                type="email"
                                placeholder="Enter student's email address"
                                value={email}
                                onChange={handleEmailChange}
                            />
                            <Form.Control.Feedback type="invalid">
                                Enter a valid email address
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom03">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Enter student's password"
                                value={password}
                                onChange={handlePasswordChange}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom05">
                            <Form.Label>Branch</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter student's branch"
                                value={branch}
                                onChange={handleBranchChange}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom06">
                            <Form.Label>Semester</Form.Label>
                            <Form.Control
                                required
                                type="number"
                                placeholder="Enter student's semester"
                                value={semester}
                                onChange={handleSemesterChange}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom04">
                            <Form.Label>Roll Number</Form.Label>
                            <Form.Control
                                required
                                type="number"
                                placeholder="Enter student's roll number"
                                value={RollNumber}
                                onChange={handleRollNoChange}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom05">
                            <Form.Label>Batch</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter batch"
                                value={batch}
                                onChange={handleBatchChange}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom06">
                            <Form.Label>Academic Year</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter academic year"
                                value={academicYear}
                                onChange={handleAcademicYearChange}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="success" type="submit">
                        {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default UpdateStudentModal;

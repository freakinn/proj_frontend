import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';

function AddStudentModal({ show, handleClose, setMessage, handleShowToast }) {
    const [validated, setValidated] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [semester, setSemester] = useState('');
    const [branch, setBranch] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNameChange = (e) => setName(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleSemesterChange = (e) => setSemester(e.target.value);
    const handleBranchChange = (e) => setBranch(e.target.value);
    const handleRollNumberChange = (e) => setRollNumber(e.target.value);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(true);
        setLoading(true);

        const response = await fetch("http://localhost:5173/api/students/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
                semester,
                branch,
                RollNumber: rollNumber,
            }),
        });
        setLoading(false);

        if (!response.ok) {
            setMessage("Failed to add student: Email already exists");
            handleShowToast();
            handleClose();
            setValidated(false);
        } else {
            setMessage("Student added successfully");
            handleShowToast();
            handleClose();
            setValidated(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Student</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body className='px-5 py-4'>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="6" controlId="validationCustom01">
                            <Form.Label>Full name</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter student's name"
                                onChange={handleNameChange}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            <Form.Control.Feedback type="invalid">
                                This field can't be blank
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom02">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter student's email address"
                                required
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
                                type="password"
                                placeholder="Enter student's password"
                                required
                                onChange={handlePasswordChange}
                            />
                            <Form.Control.Feedback>
                                Looks good!
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type="invalid">
                                This field can't be blank
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} md="6" controlId="validationCustom04">
                            <Form.Label>Semester</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter semester"
                                onChange={handleSemesterChange}
                            />
                        </Form.Group>

                        <Form.Group as={Col} md="6" controlId="validationCustom05">
                            <Form.Label>Branch</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter branch"
                                onChange={handleBranchChange}
                            />
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom06">
                            <Form.Label>Roll Number</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter roll number"
                                onChange={handleRollNumberChange}
                            />
                        </Form.Group>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="success" type="submit">
                        {loading ? <Spinner animation="border" size="sm" /> : 'Add Student'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default AddStudentModal;

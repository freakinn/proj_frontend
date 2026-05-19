import React from 'react';
import SideBar from "./AdminSideBar";
import ManageStudentsBody from './ManageStudentsBody';
import QuickMenu from './QuickMenu';

function ManageStudents() {
    return (
        <div className="d-flex">
            {/* Sidebar (Unscrollable) */}
            <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
                <SideBar />
            </div>

            {/* Middle Section (Scrollable) */}
            <div className="d-flex flex-column flex-grow-1" 
                style={{ width: "40rem", height: "100vh", overflowY: "auto" }}>
                <h4 className="m-5 mt-4 mb-1 text-success">Manage Students</h4>
                <div className="m-4 mb-4 border-bottom border-3 rounded-5" />
                <ManageStudentsBody />
            </div>

            {/* QuickMenu (Unscrollable) */}
            <div className="flex-grow-1 border-start border-3" 
                style={{ width: "5rem", position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
                <QuickMenu />
            </div>
        </div>
    );
}

export default ManageStudents;

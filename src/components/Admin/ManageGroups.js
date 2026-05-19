// import React from 'react';

// import SideBar from "./AdminSideBar";
// import ManageGropsBody from './ManageGroupsBody';
// import QuickMenu from './QuickMenu';

// function ManageGroups() {
//     return (
//         <div className="d-flex">
//             <div>
//                 <SideBar />
//             </div>

//             <div className="d-flex flex-column flex-grow-1" style={{ width: "40rem" }}>
//                 <h4 className="m-5 mt-4 mb-1 text-success">Manage Groups</h4>
//                 <div className='m-4 mb-4 border-bottom border-3 rounded-5' />
//                 <ManageGropsBody />
//             </div>

//             <div className="flex-grow-1 border-start border-3" style={{ width: "5rem" }}>
//                 <QuickMenu />
//             </div>
//         </div>
//     )
// }

// export default ManageGroups
import React from 'react';

import SideBar from "./AdminSideBar";
import ManageGropsBody from './ManageGroupsBody';
import QuickMenu from './QuickMenu';

function ManageGroups() {
    return (
        <div className="d-flex" style={{ height: "100vh" }}>
            {/* Sidebar */}
            <div
                className="side-bar"
                style={{
                    width: "20rem",  // Adjust width as needed
                    overflow: "hidden", // Prevent scrolling in sidebar
                    height: "100vh"  // Make sure sidebar covers the full height
                }}
            >
                <SideBar />
            </div>

            {/* Main Content Area - Manage Groups */}
            <div
                className="d-flex flex-column flex-grow-1"
                style={{
                    width: "5rem",  // Adjust width as needed
                    overflowY: "auto", // Make this section scrollable
                    height: "100vh"    // Full height to match the viewport
                }}
            >
                <h4 className="m-5 mt-4 mb-1 text-success">Manage Groups</h4>
                <div className='m-4 mb-4 border-bottom border-3 rounded-5' />
                <ManageGropsBody />
            </div>

            {/* Quick Menu */}
            <div
                className="quick-menu"
                style={{
                    width: "20rem",  // Adjust width as needed
                    overflow: "hidden", // Prevent scrolling in quick menu
                    height: "100vh"    // Full height to match the viewport
                }}
            >
                <QuickMenu />
            </div>
        </div>
    );
}

export default ManageGroups;

import React from 'react';
import '../index.css'
import FocusScore from '../components/Reports/FocusScore';
import Streak from '../components/Reports/Streak';



const ReportsPage: React.FC = () => {
    return (
        <div style={{ backgroundColor: 'var(--bg-secondary)' }} className="flex flex-col h-screen relative">
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">

                    <div className="mt-6 max-w-2/3">
                        <Streak />
                    </div>
                    <div className="mt-6">
                        <FocusScore />
                    </div>



                </div>
            </main>
        </div>
    );
};

export default ReportsPage;
import React from 'react';
import '../index.css'
import FocusScore from '../components/Reports/FocusScore';



const ReportsPage: React.FC = () => {
    return (
        <div style={{ backgroundColor: 'var(--bg-secondary)' }} className="flex flex-col h-screen relative">
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">


                    <div className="mt-6">
                        <FocusScore/>
                    </div>

                    
                </div>
            </main>
        </div>
    );
};

export default ReportsPage;
import '../index.css'
import Streak from '../components/Reports/Streak';
import AdvancedReports from '../components/Reports/AdvancedReports';
import AiCoachSummary from '../components/Reports/AiCoachSummary';



const ReportsPage: React.FC = () => {
    return (
        <div style={{ backgroundColor: 'var(--bg-secondary)' }} className="min-h-screen pb-24 relative">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

                <div className="mt-4">
                    <AiCoachSummary />
                </div>

                <div className="mt-6">
                    <Streak />
                </div>
                    
                    <AdvancedReports />
            </div>
        </div>
    );
};

export default ReportsPage;
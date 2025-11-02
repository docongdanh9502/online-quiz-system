import AssignQuizDialog from '../components/AssignQuizDialog';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Thêm state
const [assignDialogOpen, setAssignDialogOpen] = useState(false);
const [selectedQuizForAssign, setSelectedQuizForAssign] = useState<{ id: string; title: string } | null>(null);

// Thêm handler
const handleAssign = (quiz: Quiz) => {
  setSelectedQuizForAssign({ id: quiz._id, title: quiz.title });
  setAssignDialogOpen(true);
};

// Thêm button trong TableRow (trong RoleGuard cho teacher/admin)
<RoleGuard allowedRoles={['teacher', 'admin']}>
  <IconButton
    size="small"
    onClick={() => handleAssign(quiz)}
    color="primary"
  >
    <AssignmentIcon />
  </IconButton>
</RoleGuard>

// Thêm dialog ở cuối component
<AssignQuizDialog
  open={assignDialogOpen}
  onClose={() => {
    setAssignDialogOpen(false);
    setSelectedQuizForAssign(null);
  }}
  quizId={selectedQuizForAssign?.id || ''}
  quizTitle={selectedQuizForAssign?.title || ''}
  onSuccess={() => {
    fetchQuizzes();
  }}
/>

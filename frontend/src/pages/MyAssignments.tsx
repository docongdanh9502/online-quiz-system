const [advancedFilters, setAdvancedFilters] = useState({
  statuses: [] as string[],
  sortBy: 'dueDate',
  sortOrder: 'asc' as 'asc' | 'desc',
  dueFrom: null as Date | null,
  dueTo: null as Date | null,
});

// Cập nhật fetchAssignments
const fetchAssignments = async () => {
  setLoading(true);
  try {
    const params: any = {};

    if (advancedFilters.statuses.length > 0) {
      params.status = advancedFilters.statuses;
    }

    params.sortBy = advancedFilters.sortBy;
    params.sortOrder = advancedFilters.sortOrder;

    if (advancedFilters.dueFrom) {
      params.dueFrom = advancedFilters.dueFrom.toISOString();
    }

    if (advancedFilters.dueTo) {
      params.dueTo = advancedFilters.dueTo.toISOString();
    }

    const response = await assignmentAPI.getByStudent();
    // Filter client-side với advanced filters
    let filtered = response.assignments || [];

    if (advancedFilters.statuses.length > 0) {
      filtered = filtered.filter((a: any) =>
        advancedFilters.statuses.includes(a.status)
      );
    }

    if (advancedFilters.dueFrom) {
      filtered = filtered.filter(
        (a: any) => new Date(a.dueDate) >= advancedFilters.dueFrom!
      );
    }

    if (advancedFilters.dueTo) {
      filtered = filtered.filter(
        (a: any) => new Date(a.dueDate) <= advancedFilters.dueTo!
      );
    }

    setAssignments(filtered);
  } catch (error) {
    console.error('Lỗi khi tải assignments:', error);
  } finally {
    setLoading(false);
  }
};

// Thêm component
<AdvancedFilters
  filters={{
    statuses: [
      { value: 'pending', label: 'Chưa làm' },
      { value: 'in_progress', label: 'Đang làm' },
      { value: 'completed', label: 'Đã hoàn thành' },
      { value: 'expired', label: 'Hết hạn' },
    ],
    sortBy: [
      { value: 'dueDate', label: 'Hạn nộp' },
      { value: 'createdAt', label: 'Ngày giao' },
      { value: 'status', label: 'Trạng thái' },
    ],
  }}
  selectedFilters={advancedFilters}
  onFilterChange={handleAdvancedFilterChange}
  onReset={handleResetFilters}
/>

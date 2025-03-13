export const calculateSubtaskProgress = (task) => {
    if (!task?.subtask_list) return { total: 0, completed: 0, progress: 0 };
  
    const totalSubtasks = task.subtask_list.length;
    const completedSubtasks = task.subtask_list.filter((subtask) => subtask.subtask_status === 1).length;
    const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  
    return { total: totalSubtasks, completed: completedSubtasks, progress };
  };
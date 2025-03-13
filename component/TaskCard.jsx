import { Panel, Stack, IconButton, Checkbox, Tag, Progress } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import TrashIcon from "@rsuite/icons/Trash";
import TimeIcon from "@rsuite/icons/Time";
import ListIcon from '@rsuite/icons/List';
import { calculateSubtaskProgress } from "@/utils/taskUtils";

const TaskCard = ({ task, onClick, handlePutTaskStatus, handleDeleteTask, handlePutTask }) => {

    const { total, completed, progress } = calculateSubtaskProgress(task);

    const taskStatus = progress === 100 ? 1 : task?.task_status

    const statusMap = {
        0: { label: "Ongoing", color: "orange" },
        1: { label: "Completed", color: "green" },
        2: { label: "Past Due", color: "red" },
    };

    return (
        <Panel
            bordered
            className="p-2 flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={onClick}
        >
            <Stack justifyContent="space-between" alignItems="center">
                <h4 className="font-semibold line-clamp-1">{task.task_title}</h4>
                <Stack direction="row" alignItems="center">
                    <IconButton
                        icon={<EditIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePutTask();
                        }}
                        appearance="subtle"
                    />
                    <IconButton
                        icon={<TrashIcon color="red" />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.task_id);
                        }}
                        appearance="subtle"
                    />
                    {
                        total == 0 && (
                            <Checkbox
                                checked={task.task_status === 1}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePutTaskStatus(task.task_id);
                                }}
                            />
                        )
                    }
                </Stack>
            </Stack>

            <div className="mb-3">
                <p className="text-gray-500 text-sm line-clamp-1">{task?.task_desc}</p>
            </div>

            {
                total > 0 && (
                    <div>
                        <Stack direction="row" alignItems="center" spacing={10}>
                            <ListIcon className="text-gray-500 text-xs" />
                            <p className="font-medium text-gray-500 text-xs">Progress</p>
                        </Stack>
                        <Progress.Line percent={progress} strokeColor={progress === 100 ? "green" : "orange"} style={{ padding: 0, marginTop: 3 }} />
                    </div>
                )
            }

            {
                task.task_due_date ? (
                    <Stack direction="row" alignItems="center" justifyContent="space-between" className="mt-3">
                        <Tag className="font-medium">
                            {new Date(task.task_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            {
                                task.task_due_time && (
                                    <>
                                        ,{" "}
                                        {new Date(`1970-01-01T${task.task_due_time}Z`).toLocaleTimeString('en-US', {
                                            hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false
                                        })}
                                    </>
                                )
                            }
                        </Tag>
                        <Tag color={statusMap[taskStatus]?.color}>
                            {statusMap[taskStatus]?.label}
                        </Tag>
                    </Stack>
                ) : (
                    <Stack justifyContent="flex-end" className="mt-3">
                        <Tag color={statusMap[taskStatus]?.color}>
                            {statusMap[taskStatus]?.label}
                        </Tag>
                    </Stack>
                )
            }
        </Panel>
    );
};

export default TaskCard;

import { useEffect, useState } from "react";
import { Button, ButtonGroup, Container, Content, Header, IconButton, Nav, Panel, Stack, Checkbox, Progress, Tag, Modal, PanelGroup, Form, Input, DatePicker } from "rsuite";
import PlusIcon from '@rsuite/icons/Plus';
import TrashIcon from '@rsuite/icons/Trash';
import EditIcon from '@rsuite/icons/Edit';
import TimeIcon from '@rsuite/icons/Time';
import RemindFillIcon from '@rsuite/icons/RemindFill';
import TaskCard from "@/component/TaskCard";
import TaskAPI from "./api/task_api";
import { format } from "date-fns";
import SubtaskAPI from "./api/subtask_api";
import { calculateSubtaskProgress } from "@/utils/taskUtils";
import Toaster from "@/component/Toaster";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [taskList, setTaskList] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailTaskModal, setShowDetailTaskModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [showCreateSubtaskModal, setShowCreateSubtaskModal] = useState(false);
  const [showUpdateSubtaskModal, setShowUpdateSubtaskModal] = useState(false);
  const [showDeleteSubtaskModal, setShowDeleteSubtaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [subtaskToDelete, setSubtaskToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const emptyTaskForm = {
    task_title: null,
    task_desc: null,
    task_due_date: null,
    task_due_time: null,
  }
  const [taskForm, setTaskForm] = useState(emptyTaskForm);

  const emptyErrorTaskForm = {
    task_title: null,
  }
  const [errorTaskForm, setErrorTaskForm] = useState(emptyErrorTaskForm);

  const emptySubtaskForm = {
    task_id: null,
    subtask_title: null,
    subtask_desc: null,
    subtask_due_date: null,
    subtask_due_time: null,
  }
  const [subtaskForm, setSubtaskForm] = useState(emptySubtaskForm);

  const emptyErrorSubtaskForm = {
    subtask_title: null,
  }
  const [errorSubtaskForm, setErrorSubtaskForm] = useState(emptyErrorSubtaskForm);

  const { total, completed, progress } = calculateSubtaskProgress(selectedTask);

  const statusMap = {
    0: { label: "Ongoing", color: "orange" },
    1: { label: "Completed", color: "green" },
    2: { label: "Past Due", color: "red" },
  };

  const showToast = (message, type) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleGetTaskListByStatus = async (status) => {
    try {
      const res = await TaskAPI.getTaskListByStatus({ task_status: status });
      setTaskList(res.data ? res.data : []);
    } catch (err) {
      console.log(err);
      showToast("Error: Please try again later!", "error")
    }
  }

  const handlePostTask = async () => {
    try {
      if (!taskForm.task_title) {
        setErrorTaskForm((prevError) => ({ ...prevError, task_title: "Title can't be empty" }))
        return;
      }

      const res = await TaskAPI.postTask(taskForm);

      if (res.status === 200) {
        showToast("Task created successfully!", "success");
        setShowCreateTaskModal(false);
        setTaskForm(emptyTaskForm);
        handleGetTaskListByStatus(activeTab);
      } else {
        showToast("Failed to create task!", "error")
      }
    } catch (err) {
      console.log(err);
      showToast("Error: Please try again later!", "error")
    }
  }

  const handlePutTask = async () => {
    try {
      if (!taskForm.task_title) {
        setErrorTaskForm((prevError) => ({ ...prevError, task_title: "Title can't be empty" }))
        return;
      }

      const res = await TaskAPI.putTask(taskForm);

      if (res.status === 200) {
        showToast("Task updated successfully!", "success")
        setShowUpdateTaskModal(false);
        setTaskForm(emptyTaskForm);
        handleGetTaskListByStatus(activeTab);
      } else {
        showToast("Failed to update task!", "error")
      }
    } catch (err) {
      console.log(err)
      showToast("Error: Please try again later!", "error")
    }
  }

  const handlePutTaskStatus = async (taskId) => {
    try {
      let taskStatus = activeTab === 0 ? 1 : 0;

      const res = await TaskAPI.putTaskStatus({
        task_id: taskId,
        task_status: taskStatus,
      })

      if (res.status === 200) {
        showToast("Task status updated successfully!", "success")
        handleGetTaskListByStatus(activeTab);
      } else {
        showToast("Failed to update task status!", "error")
      }

    } catch (err) {
      console.log(err);
      showToast("Error: Please try again later!", "error")
    }
  }

  const handleDeleteTask = async () => {
    try {
      const res = await TaskAPI.deleteTask({
        task_id: taskToDelete,
      });

      if (res.status === 200) {
        showToast("Task deleted successfully!", "success")
        setShowDeleteTaskModal(false);
        setTaskToDelete(null);
      } else {
        showToast("Failed to delete task!", "error")
      }

      handleGetTaskListByStatus(activeTab);
    } catch (err) {
      console.log(err)
      showToast("Error: Please try again later!", "error")
    }
  }

  useEffect(() => {
    handleGetTaskListByStatus(activeTab);
  }, [activeTab]);

  const handlePostSubtask = async () => {
    try {
      if (!subtaskForm.subtask_title) {
        setErrorSubtaskForm((prevError) => ({ ...prevError, subtask_title: "Title can't be empty" }))
        return;
      }

      const res = await SubtaskAPI.postSubtask(subtaskForm);

      if (res.status === 200) {
        showToast("Subtask created successfully!", "success")

        if (selectedTask?.task_status === 1) {
          await handlePutTaskStatus(selectedTask?.task_id, 0)
        }

        setShowCreateSubtaskModal(false);
        setSubtaskForm(emptySubtaskForm);
        handleGetTaskListByStatus(activeTab);
      } else {
        showToast("Failed to create task!", "error")
      }
    } catch (err) {
      console.log(err)
      showToast("Error: Please try again later!", "error")
    }
  }

  const handlePutSubtask = async () => {
    try {
      if (!subtaskForm.subtask_title) {
        setErrorSubtaskForm((prevError) => ({ ...prevError, subtask_title: "Title can't be empty" }))
        return;
      }

      const res = await SubtaskAPI.putSubtask(subtaskForm);

      if (res.status === 200) {
        showToast("Subtask updated successfully!", "success")
        
        setShowUpdateSubtaskModal(false);
        setSubtaskForm(emptyTaskForm);
        handleGetTaskListByStatus(activeTab);
      } else {
        showToast("Failed to update subtask!", "error")
      }
    } catch (err) {
      console.log(err)
      showToast("Error: Please try again later!", "error")
    }
  }

  const handlePutSubtaskStatus = async (subtaskId, subtaskStatus) => {
    try {

      let newSubtaskStatus = subtaskStatus === 0 ? 1 : 0;

      const updatedSubtasks = selectedTask?.subtask_list.map((subtask) =>
        subtask.subtask_id === subtaskId
          ? { ...subtask, subtask_status: newSubtaskStatus }
          : subtask
      );

      const { progress } = calculateSubtaskProgress({
        ...selectedTask,
        subtask_list: updatedSubtasks,
      });

      const res = await SubtaskAPI.putSubtaskStatus({
        subtask_id: subtaskId,
        subtask_status: newSubtaskStatus,
      })

      if (progress === 100 && selectedTask?.task_status !== 1) {
        await handlePutTaskStatus(selectedTask?.task_id, 1);
      } else if (progress !== 100 && selectedTask?.task_status === 1) {
        await handlePutTaskStatus(selectedTask?.task_id, 0)
      }

      if (res.status === 200) {
        showToast("Subtask status updated successfully", "success")
        setShowDetailTaskModal(false);
        setSelectedTask(null);
        handleGetTaskListByStatus(activeTab);
      } else {
        showToast("Failed to update subtask status!", "error")
      }
    } catch (err) {
      console.log(err);
      showToast("Error: Please try again later!", "error")
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const res = await SubtaskAPI.deleteSubtask({
        subtask_id: subtaskId,
      });

      if (res.status === 200) {
        showToast("Subtask deleted successfully!", "success")

        const updatedSubtasks = selectedTask?.subtask_list.filter((subtask) =>
          subtask.subtask_id !== subtaskId
        );

        const { progress } = calculateSubtaskProgress({
          ...selectedTask,
          subtask_list: updatedSubtasks,
        });

        if (progress === 100 && selectedTask?.task_status !== 1) {
          await handlePutTaskStatus(selectedTask?.task_id, 1);
        }

        setShowDeleteSubtaskModal(false);
        setSubtaskToDelete(null);
        handleGetTaskListByStatus(activeTab);
      } else {
        showToast("Failed to delete subtask!", "error")
      }
    } catch (err) {
      console.log(err)
      showToast("Error: Please try again later!", "error")
    }
  }

  return (
    <div className="p-10 min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
      <Container className="h-full">

        {toast && <Toaster message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <Panel className="mb-4 bg-white shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]" style={{ borderRadius: "15px" }}>
          <Header className="mx-4">
            <h2>Hello!</h2>
            <p className="text-gray-500">What do you plan to do today?</p>
          </Header>
        </Panel>

        <Content className="flex-grow mt-2">
          <Panel className="p-4 min-h-[80vh] w-full bg-white shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]" style={{ borderRadius: "15px" }}>
            <Stack justifyContent="space-between">
              <Nav activeKey={activeTab} onSelect={setActiveTab} appearance="subtle" className="text-sm">
                <Nav.Item eventKey={0}>Ongoing</Nav.Item>
                <Nav.Item eventKey={1}>Completed</Nav.Item>
              </Nav>
              <Button startIcon={<PlusIcon />} appearance="primary" onClick={() => setShowCreateTaskModal(true)}>New Task</Button>
            </Stack>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {taskList.map((task, index) => (
                <TaskCard
                  key={index}
                  task={task}
                  onClick={() => {
                    setSelectedTask(task);
                    setShowDetailTaskModal(true);
                  }}
                  handlePutTaskStatus={handlePutTaskStatus}
                  handleDeleteTask={() => {
                    setTaskToDelete(task.task_id);
                    setShowDeleteTaskModal(true);
                  }}
                  handlePutTask={() => {
                    setTaskForm(task);
                    setShowUpdateTaskModal(true);
                  }}
                />
              ))}
            </div>
          </Panel>
        </Content>
      </Container>

      {/* View task detail */}
      <Modal open={showDetailTaskModal} onClose={() => { setShowDetailTaskModal(false); setSelectedTask(null) }} size="md">
        <Modal.Header>
          <Modal.Title>
            <Stack alignItems="center" className="gap-3">
              {selectedTask?.task_title}
              <Tag color={statusMap[selectedTask?.task_status]?.color}>
                {statusMap[selectedTask?.task_status]?.label}
              </Tag>
            </Stack>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask?.task_desc && <p className="text-gray-500 text-sm">{selectedTask.task_desc}</p>}
          {
            selectedTask?.task_due_date && (
              <Stack
                alignItems="center"
                spacing={5}
                className="text-sm mt-3"
              >
                <TimeIcon />
                {new Date(selectedTask.task_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                {
                  selectedTask?.task_due_time && (
                    <>
                      ,{" "}
                      {new Date(`1970-01-01T${selectedTask.task_due_time}Z`).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false
                      })}
                    </>
                  )
                }
              </Stack>
            )
          }
          <Stack justifyContent="space-between" alignItems="center" className="mt-2 mr-2">
            <div className="flex items-center">
              {
                total > 0 && (
                  <>
                    <p className="font-medium">Subtask Progress: </p>
                    <Progress.Line percent={progress} strokeColor={progress === 100 ? "green" : "orange"} style={{ width: 200 }} />
                  </>
                )
              }
            </div>
            <div>
              <IconButton
                icon={<EditIcon />}
                onClick={() => {
                  setTaskForm(selectedTask);
                  setShowDetailTaskModal(false);
                  setShowUpdateTaskModal(true);
                }}
                appearance="subtle"
              />
              <IconButton
                icon={<TrashIcon color="red" />}
                onClick={() => {
                  setShowDetailTaskModal(false);
                  setTaskToDelete(selectedTask.task_id);
                  setShowDeleteTaskModal(true);
                }}
                appearance="subtle"
              />
              {
                total == 0 && (
                  <Checkbox
                    checked={selectedTask?.task_status === 1}
                    onClick={(e) => {
                      handlePutTaskStatus(selectedTask?.task_id);
                      setShowDetailTaskModal(false);
                    }}
                  />
                )
              }
            </div>
          </Stack>

          <Stack justifyContent="flex-end" className="mt-4">
            <Button startIcon={<PlusIcon />} appearance="primary" onClick={() => {
              setShowDetailTaskModal(false);
              setSubtaskForm((prevForm) => ({ ...prevForm, task_id: selectedTask.task_id }))
              setShowCreateSubtaskModal(true);
            }}>New Subtask</Button>
          </Stack>

          {selectedTask?.subtask_list?.length > 0 && (
            <div className="mt-4">
              <h5 className="font-semibold mb-2">Subtasks</h5>
              <PanelGroup accordion bordered className="mt-2">
                {selectedTask.subtask_list.map((subtask, index) => (
                  <Panel key={index} header={subtask.subtask_title} defaultExpanded>
                    {subtask.subtask_desc && <p className="text-gray-500 text-sm">{subtask.subtask_desc}</p>}
                    {subtask.subtask_due_date && (
                      <Stack
                        alignItems="center"
                        spacing={5}
                        className={`text-sm mt-3 ${subtask.subtask_status === 2 ? 'text-red-500' : 'text-gray-600'}`}
                      >
                        <TimeIcon />
                        {new Date(subtask.subtask_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        {
                          subtask.subtask_due_time && (
                            <>
                              ,{" "}
                              {new Date(`1970-01-01T${subtask.subtask_due_time}Z`).toLocaleTimeString('en-US', {
                                hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false
                              })}
                            </>
                          )
                        }
                      </Stack>
                    )}
                    <Stack justifyContent="space-between" alignItems="center" className="mt-2">
                      <Tag color={statusMap[subtask.subtask_status]?.color}>
                        {statusMap[subtask.subtask_status]?.label}
                      </Tag>
                      <div>
                        <IconButton
                          icon={<EditIcon />}
                          appearance="subtle"
                          onClick={() => {
                            setShowDetailTaskModal(false);
                            setSubtaskForm(subtask);
                            setShowUpdateSubtaskModal(true);
                          }}
                        />
                        <IconButton
                          icon={<TrashIcon color="red" />}
                          onClick={() => {
                            setShowDetailTaskModal(false);
                            setSubtaskToDelete(subtask.subtask_id);
                            setShowDeleteSubtaskModal(true);
                          }}
                          appearance="subtle"
                        />
                        <Checkbox
                          checked={subtask.subtask_status == 1}
                          onClick={() => {
                            handlePutSubtaskStatus(subtask.subtask_id, subtask.subtask_status)
                          }}
                        />
                      </div>
                    </Stack>
                  </Panel>
                ))}
              </PanelGroup>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Create task */}
      <Modal
        open={showCreateTaskModal}
        onClose={() => { setShowCreateTaskModal(false); setTaskForm(emptyTaskForm); setErrorTaskForm(emptyErrorTaskForm) }}
      >
        <Modal.Header>Create New Task</Modal.Header>
        <Modal.Body>
          <Form fluid>
            <Form.Group>
              <Form.ControlLabel>Title <span className="text-red-500">*</span></Form.ControlLabel>
              <Form.Control
                name="task_title"
                value={taskForm.task_title || ""}
                onChange={(value) => {
                  setTaskForm((prevTaskForm) => ({
                    ...prevTaskForm,
                    task_title: value
                  }));
                  setErrorTaskForm({ ...errorTaskForm, task_title: null })
                }}
                errorMessage={errorTaskForm.task_title}
              />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>Description</Form.ControlLabel>
              <Input
                name="task_desc"
                as="textarea"
                rows={5}
                value={taskForm.task_desc || ""}
                onChange={(value) => {
                  setTaskForm((prevTaskForm) => ({
                    ...prevTaskForm,
                    task_desc: value
                  }))
                }}
              />
            </Form.Group>
            <div className="flex gap-4 w-full">
              <Form.Group className="flex-1">
                <Form.ControlLabel>Due Date</Form.ControlLabel>
                <DatePicker
                  format="dd/MM/yyyy"
                  name="task_due_date"
                  value={taskForm.task_due_date ? new Date(taskForm.task_due_date) : null}
                  onChange={(value) => {
                    const formattedDate = value ? format(value, "yyyy-MM-dd") : "";
                    setTaskForm((prev) => ({ ...prev, task_due_date: formattedDate }));
                  }}
                  className="w-full"
                />
              </Form.Group>
              <Form.Group className="flex-1">
                <Form.ControlLabel>Due Time</Form.ControlLabel>
                <DatePicker
                  format="HH:mm"
                  name="task_due_time"
                  value={taskForm.task_due_time ? new Date(`1970-01-01T${taskForm.task_due_time}`) : null}
                  onChange={(value) => {
                    const formattedTime = value ? format(value, "HH:mm:ss") : "";
                    setTaskForm((prev) => ({ ...prev, task_due_time: formattedTime }));
                  }}
                  disabled={!taskForm.task_due_date}
                  className="w-full"
                />
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Stack justifyContent="flex-end">
            <Button
              appearance="primary"
              type="submit"
              color="blue"
              onClick={() => {
                handlePostTask();
              }}
            >
              Create
            </Button>
          </Stack>
        </Modal.Footer>
      </Modal>

      {/* Update task */}
      <Modal
        open={showUpdateTaskModal}
        onClose={() => { setShowUpdateTaskModal(false); setTaskForm(emptyTaskForm); setErrorTaskForm(emptyErrorTaskForm) }}
      >
        <Modal.Header>Update Task</Modal.Header>
        <Modal.Body>
          <Form fluid>
            <Form.Group>
              <Form.ControlLabel>Title <span className="text-red-500">*</span></Form.ControlLabel>
              <Form.Control
                name="task_title"
                value={taskForm.task_title || ""}
                onChange={(value) => {
                  setTaskForm((prevTaskForm) => ({
                    ...prevTaskForm,
                    task_title: value
                  }));
                  setErrorTaskForm({ ...errorTaskForm, task_title: null })
                }}
                errorMessage={errorTaskForm.task_title}
              />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>Description</Form.ControlLabel>
              <Input
                name="task_desc"
                as="textarea"
                rows={5}
                value={taskForm.task_desc || ""}
                onChange={(value) => {
                  setTaskForm((prevTaskForm) => ({
                    ...prevTaskForm,
                    task_desc: value
                  }))
                }}
              />
            </Form.Group>
            <div className="flex gap-4 w-full">
              <Form.Group className="flex-1">
                <Form.ControlLabel>Due Date</Form.ControlLabel>
                <DatePicker
                  format="dd/MM/yyyy"
                  name="task_due_date"
                  value={taskForm.task_due_date ? new Date(taskForm.task_due_date) : null}
                  onChange={(value) => {
                    setTaskForm((prev) => ({
                      ...prev,
                      task_due_date: value ? format(value, "yyyy-MM-dd") : null,
                      task_due_time: value ? prev.task_due_time : null,
                    }));
                  }}
                  className="w-full"
                />
              </Form.Group>
              <Form.Group className="flex-1">
                <Form.ControlLabel>Due Time</Form.ControlLabel>
                <DatePicker
                  format="HH:mm"
                  name="task_due_time"
                  value={taskForm.task_due_time ? new Date(`1970-01-01T${taskForm.task_due_time}`) : null}
                  onChange={(value) => {
                    const formattedTime = value ? format(value, "HH:mm:ss") : null;
                    setTaskForm((prev) => ({ ...prev, task_due_time: formattedTime }));
                  }}
                  disabled={!taskForm.task_due_date}
                  className="w-full"
                />
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Stack justifyContent="flex-end">
            <Button
              appearance="primary"
              type="submit"
              color="blue"
              onClick={() => {
                handlePutTask();
              }}
            >
              Update
            </Button>
          </Stack>
        </Modal.Footer>
      </Modal>

      {/* Delete task */}
      <Modal open={showDeleteTaskModal} backdrop="static" role="alertdialog" onClose={() => { setShowDeleteTaskModal(false); setTaskToDelete(null) }}>
        <Modal.Body>
          <RemindFillIcon style={{ color: '#ffb300', marginRight: '5px' }} />
          Are you sure you want to delete the task and all its subtasks? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Stack direction="row" className="gap-4" justifyContent="flex-end">
            <Button
              onClick={() => { setShowDeleteTaskModal(false) }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              appearance="primary"
              onClick={() => { handleDeleteTask() }}
            >
              Delete
            </Button>
          </Stack>
        </Modal.Footer>
      </Modal>

      {/* Create subtask */}
      <Modal
        open={showCreateSubtaskModal}
        onClose={() => {
          setShowCreateSubtaskModal(false);
          setSubtaskForm(emptySubtaskForm);
          setErrorSubtaskForm(emptyErrorSubtaskForm);
        }}
      >
        <Modal.Header>Create Subtask</Modal.Header>
        <Modal.Body>
          <Form fluid>
            <Form.Group>
              <Form.ControlLabel>Title <span className="text-red-500">*</span></Form.ControlLabel>
              <Form.Control
                name="subtask_title"
                value={subtaskForm.subtask_title || ""}
                onChange={(value) => {
                  setSubtaskForm((prevSubtaskForm) => ({
                    ...prevSubtaskForm,
                    subtask_title: value
                  }));
                  setErrorSubtaskForm({ ...errorSubtaskForm, subtask_title: null })
                }}
                errorMessage={errorSubtaskForm.subtask_title}
              />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>Description</Form.ControlLabel>
              <Input
                name="subtask_desc"
                as="textarea"
                rows={5}
                value={subtaskForm.subtask_desc || ""}
                onChange={(value) => {
                  setSubtaskForm((prevTaskForm) => ({
                    ...prevTaskForm,
                    subtask_desc: value
                  }))
                }}
              />
            </Form.Group>
            <div className="flex gap-4 w-full">
              <Form.Group className="flex-1">
                <Form.ControlLabel>Due Date</Form.ControlLabel>
                <DatePicker
                  format="dd/MM/yyyy"
                  name="subtask_due_date"
                  value={subtaskForm.subtask_due_date ? new Date(subtaskForm.subtask_due_date) : null}
                  onChange={(value) => {
                    const formattedDate = value ? format(value, "yyyy-MM-dd") : "";
                    setSubtaskForm((prev) => ({ ...prev, subtask_due_date: formattedDate }));
                  }}
                  className="w-full"
                />
              </Form.Group>
              <Form.Group className="flex-1">
                <Form.ControlLabel>Due Time</Form.ControlLabel>
                <DatePicker
                  format="HH:mm"
                  name="subtask_due_time"
                  value={subtaskForm.subtask_due_time ? new Date(`1970-01-01T${subtaskForm.subtask_due_time}`) : null}
                  onChange={(value) => {
                    const formattedTime = value ? format(value, "HH:mm:ss") : "";
                    setSubtaskForm((prev) => ({ ...prev, subtask_due_time: formattedTime }));
                  }}
                  disabled={!subtaskForm.subtask_due_date}
                  className="w-full"
                />
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Stack justifyContent="flex-end">
            <Button
              appearance="primary"
              type="submit"
              color="blue"
              onClick={() => {
                handlePostSubtask();
              }}
            >
              Create
            </Button>
          </Stack>
        </Modal.Footer>
      </Modal>

      {/* Update subtask */}
      <Modal
        open={showUpdateSubtaskModal}
        onClose={() => {
          setShowUpdateSubtaskModal(false);
          setSubtaskForm(emptySubtaskForm);
          setErrorSubtaskForm(emptyErrorSubtaskForm);
        }}
      >
        <Modal.Header>Update Subtask</Modal.Header>
        <Modal.Body>
          <Form fluid>
            <Form.Group>
              <Form.ControlLabel>Title <span className="text-red-500">*</span></Form.ControlLabel>
              <Form.Control
                name="subtask_title"
                value={subtaskForm.subtask_title || ""}
                onChange={(value) => {
                  setSubtaskForm((prevSubtaskForm) => ({
                    ...prevSubtaskForm,
                    subtask_title: value
                  }));
                  setErrorSubtaskForm({ ...errorSubtaskForm, subtask_title: null })
                }}
                errorMessage={errorSubtaskForm.subtask_title}
              />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>Description</Form.ControlLabel>
              <Input
                name="subtask_desc"
                as="textarea"
                rows={5}
                value={subtaskForm.subtask_desc || ""}
                onChange={(value) => {
                  setSubtaskForm((prevTaskForm) => ({
                    ...prevTaskForm,
                    subtask_desc: value
                  }))
                }}
              />
            </Form.Group>
            <div className="flex gap-4 w-full">
              <Form.Group className="flex-1">
                <Form.ControlLabel>Due Date</Form.ControlLabel>
                <DatePicker
                  format="dd/MM/yyyy"
                  name="subtask_due_date"
                  value={subtaskForm.subtask_due_date ? new Date(subtaskForm.subtask_due_date) : null}
                  onChange={(value) => {
                    setSubtaskForm((prev) => ({
                      ...prev,
                      subtask_due_date: value ? format(value, "yyyy-MM-dd") : null,
                      subtask_due_time: value ? prev.subtask_due_time : null,
                    }));
                  }}
                  className="w-full"
                />
              </Form.Group>
              <Form.Group className="flex-1">
                <Form.ControlLabel>Due Time</Form.ControlLabel>
                <DatePicker
                  format="HH:mm"
                  name="subtask_due_time"
                  value={subtaskForm.subtask_due_time ? new Date(`1970-01-01T${subtaskForm.subtask_due_time}`) : null}
                  onChange={(value) => {
                    const formattedTime = value ? format(value, "HH:mm:ss") : "";
                    setSubtaskForm((prev) => ({ ...prev, subtask_due_time: formattedTime }));
                  }}
                  disabled={!subtaskForm.subtask_due_date}
                  className="w-full"
                />
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Stack justifyContent="flex-end">
            <Button
              appearance="primary"
              type="submit"
              color="blue"
              onClick={() => {
                handlePutSubtask();
              }}
            >
              Update
            </Button>
          </Stack>
        </Modal.Footer>
      </Modal>

      {/* Delete subtask */}
      <Modal open={showDeleteSubtaskModal} backdrop="static" role="alertdialog" onClose={() => { setShowDeleteSubtaskModal(false) }}>
        <Modal.Body>
          <RemindFillIcon style={{ color: '#ffb300', marginRight: '5px' }} />
          Are you sure you want to delete the subtask? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Stack direction="row" className="gap-4" justifyContent="flex-end">
            <Button
              onClick={() => { setShowDeleteSubtaskModal(false) }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              appearance="primary"
              onClick={() => { handleDeleteSubtask(subtaskToDelete) }}
            >
              Delete
            </Button>
          </Stack>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

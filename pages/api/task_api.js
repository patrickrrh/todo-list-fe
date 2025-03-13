import axios from "axios";

const createTaskApiFunction = (method, url) => async (data) => {
  try {
    const response = await axios[method](
      `${process.env.NEXT_PUBLIC_LOCAL_SERVICE}/task/${url}`,
      data
    );
    return response.data;
  } catch (err) {
    return err.response?.data || { error: "An unknown error occurred" };
  }
};

const TaskAPI = {
  getTaskListByStatus: createTaskApiFunction("post", "list"),
  postTask: createTaskApiFunction("post", "create"),
  putTask: createTaskApiFunction("put", "update"),
  deleteTask: createTaskApiFunction("post", "delete"),
  putTaskStatus: createTaskApiFunction("put", "status"),
};

export default TaskAPI;
import axios from "axios";

const createTaskApiFunction = (method, url) => async (data) => {
  try {
    const response = await axios[method](
      `${process.env.NEXT_PUBLIC_LOCAL_SERVICE}/subtask/${url}`,
      data
    );
    return response.data;
  } catch (err) {
    return err.response?.data || { error: "An unknown error occurred" };
  }
};

const SubtaskAPI = {
  postSubtask: createTaskApiFunction("post", "create"),
  putSubtask: createTaskApiFunction("put", "update"),
  deleteSubtask: createTaskApiFunction("post", "delete"),
  putSubtaskStatus: createTaskApiFunction("put", "status"),
};

export default SubtaskAPI;
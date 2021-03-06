import { Input, Button, Message } from "../styles/antd";
import axios from "axios";
import withAuth from "../hocs/withAuth";
import { AuthContext } from "../context/Auth";
import Cookies from "js-cookie";
import TaskList from "../components/TaskList";
import { PlusOutlined } from "@ant-design/icons";
import Router from "next/router";
import {
  addNewTask,
  delTask,
  updateTaskStatus,
  updateTaskPriority,
} from "../api/index";
import env from "../config/environment";

export const statusTable = [
  { id: 1, type: "Not started" },
  { id: 2, type: "In progess" },
  { id: 3, type: "Completed" },
  { id: 4, type: "Cancell" },
];

const Board = (props) => {
  const [inputValue, setInputValue] = React.useState("");
  const [selsect, setSelsect] = React.useState(new Set());
  const [checked, setChecked] = React.useState(false);
  const [tasks, setTasks] = React.useState(props.tasks);
  const { token, setAuthentication, setToken } = React.useContext(AuthContext);

  const handleAddNewTask = async () => {
    if (inputValue === undefined || inputValue === "") {
      Message.info({ content: "Task cannot be empity.", duration: 1 });
      return;
    }
    const newTask = await addNewTask(
      {
        content: inputValue,
      },
      token,
    );

    tasks.push(newTask);
    setTasks(tasks);
    setInputValue("");
  };
  const handleDeleteTask = async (taskId) => {
    delTask(taskId, token);
    const newTasks = tasks.filter((task) => task._id !== taskId);
    setTasks(newTasks);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    updateTaskStatus(
      {
        status: newStatus,
      },
      taskId,
      token,
    );

    const updated = tasks.map((task) => {
      if (task._id === taskId) {
        task.status = parseInt(newStatus);
      }
      return task;
    });

    setTasks(updated);
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    updateTaskPriority(
      {
        priority: newPriority,
      },
      taskId,
      token,
    );
    const updated = tasks.map((task) => {
      if (task._id === taskId) {
        task.priority = newPriority;
      }
      return task;
    });

    setTasks(updated);
  };

  const handleLogOut = () => {
    setAuthentication(false);
    setToken("");
    Cookies.remove("__session");
  };

  const handleMutiDelete = () => {
    selsect.forEach((taskId) => {
      handleDeleteTask(taskId);
      delTask(taskId, token);
    });
    const newTasks = [];
    for (const task of tasks) {
      if (!selsect.has(task._id)) {
        newTasks.push(task);
      }
    }
    setTasks(newTasks);
    setSelsect(new Set());
    setChecked(false);
  };

  return (
    <div className="addTaskBox">
      <div className="btn_wrapper">
        <Button
          className="btn"
          ghost={true}
          size="large"
          onClick={() => {
            Router.push("/reset_password");
          }}
        >
          Reset Password
        </Button>
        <Button
          className="btn"
          ghost={true}
          size="large"
          onClick={handleLogOut}
        >
          Log out
        </Button>
      </div>
      <div
        style={{
          width: "100%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ width: "20%" }}></div>
        <Input
          prefix={<PlusOutlined className="site-form-item-icon" />}
          placeholder="Add new tasks and press Enter!"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onPressEnter={handleAddNewTask}
          size="large"
          allowClear
          style={{ width: "60%" }}
        />
        <div style={{ width: "20%", textAlign: "center" }}>
          <Button
            style={{
              backgroundColor: "#de123e",
              color: "white",
            }}
            className={checked ? "" : "show"}
            onClick={handleMutiDelete}
          >
            Delete
          </Button>
        </div>
      </div>
      <div id="tableHeader">
        <div id="header_task">Task</div>
        <div>
          <div id="header_status">Status</div>
          <div id="header_pri">Priority</div>
          <div id="header_link">Public Link</div>
          <div id="header_del">Delete</div>
        </div>
      </div>
      {statusTable.map((status) => {
        return (
          <TaskList
            key={status.type}
            dataSource={tasks}
            type={status.type}
            typeId={status.id}
            handleDeleteTask={handleDeleteTask}
            handleStatusChange={handleStatusChange}
            handlePriorityChange={handlePriorityChange}
            statusTable={statusTable}
            setChecked={setChecked}
            setSelsect={setSelsect}
            selsect={selsect}
            checked={checked}
          />
        );
      })}
      <style global jsx>{`
        .ant-input-affix-wrapper-lg {
          max-height: 55px;
        }
        .addTaskBox {
          width: 80%;
          margin: 0 auto;
          margin-top: 30px;
        }
        .show {
          display: none;
        }
      `}</style>
    </div>
  );
};

Board.getInitialProps = async (ctx) => {
  let token = "";
  if (ctx.req) {
    token = ctx.token;
  } else {
    token = Cookies.get("__session");
  }
  if (token !== "" && token !== undefined) {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const resp = await axios.get(env.API + "/v1/board/tasks/all", config);
    const tasks = resp.data.tasks;
    return { tasks };
  }
  return;
};

export default withAuth(Board);

require('dotenv').config()
const fetch = require('node-fetch')
const nbTasks = parseInt(process.env.TASKS) || 20

const randInt = (min, max) => Math.floor(Math.random() * (max - min)) + min
const taskType = () => (randInt(0, 2) ? 'mult' : 'add')
const args = () => ({ a: randInt(0, 40), b: randInt(0, 40) })

const generateTasks = i =>
  new Array(i).fill(1).map(_ => ({ type: taskType(), args: args() }))

// --scale worker=4
let workers_ADD = ['http://localhost:3000','http://localhost:3001','http://localhost:3002','http://localhost:3003']
let workers_MULT = ['http://localhost:3004','http://localhost:3005','http://localhost:3006','http://localhost:3007']
let workers = workers_ADD.concat(workers_MULT)
let tasks = generateTasks(nbTasks)
let taskToDo = nbTasks

const wait = mili => new Promise((resolve, reject) => setTimeout(resolve, mili))

const sendTask = async (worker, task) => {
  console.log(`${worker}/${task.type}`, task)
  workers = workers.filter(w => w !== worker)
  if (task.type === "mult"){
    workers_MULT = workers_MULT.filter(w => w !== worker)
  }
  else{
    workers_ADD = workers_ADD.filter(w => w !== worker)
  }
  tasks = tasks.filter(t => t !== task)
  const request = fetch(`${worker}/${task.type}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task.args),
  })
    .then(res => {
      workers = [...workers, worker]
      if (task.type === "mult"){
        workers_MULT = [...workers_MULT, worker]
      }
      else{
        workers_ADD = [...workers_ADD, worker]
      }
      return res.json()
    })
    .then(res => {
      taskToDo -= 1
      console.log(task, 'has res', res)
      return res
    })
    .catch(err => {
      console.log(task, ' failed')
      tasks = [...tasks, task]
    })
}

const main = async () => {
  console.log(tasks)
  let i = 0
  while (taskToDo > 0) {
    await wait(100)
    if (workers.length === 0 || tasks.length === 0) continue
    // console.log(tasks.get("type"))
    if (tasks[0].type == "mult"){
      sendTask(workers_MULT[0], tasks[0])
    }
    else{
      sendTask(workers_ADD[0], tasks[0])
    }
  }
}

main()

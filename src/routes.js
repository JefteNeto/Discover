const express = require("express");
const routes = express.Router();

const views = __dirname + "/views/";

const Profile = {
  data: {
    name: "Jefte",
    avatar: "https://bit.ly/324lsdv",
    "monthly-budget": 3000,
    "days-per-week": 5,
    "hours-per-day": 5,
    "vacation-per-year": 4,
    "value-hour": 75,
  },
  controllers: {
    index(req, res) {
      res.render(views + "profile", { profile: Profile.data });
    },
    update(req, res) {
      //req.body.para pegar os dados
      const data = req.body;
      //definir quantas semanas tem no ano: 52
      const weeksPerYear = 52;
      //remover as semanas de ferias do ano
      const weeksPerMonth = (weeksPerYear - data["vacation-per-year"]) / 12;
      //horas semanais de trabalho
      const weekTotalHours = data["hours-per-day"] * data["days-per-week"];
      //total de horas mensais
      const monthlyTotalHours = weekTotalHours * weeksPerMonth;
      //valor da horas de trabalho
      const valueHour = data["monthly-budget"] / monthlyTotalHours;

      Profile.data = {
        ...Profile.data,
        ...req.body,
        "value-hour": valueHour,
      };
      return res.redirect("/profile");
    },
  },
};

const Job = {
  data: [
    {
      id: 1,
      name: "Pizzaria Guloso",
      "daily-hours": 2,
      "total-hours": 1,
      created_at: Date.now(), //atribuindo data de hj
      budget: 4500,
    },
    {
      id: 2,
      name: "One Two Projects",
      "daily-hours": 3,
      "total-hours": 47,
      created_at: Date.now(), //atribuindo data de hj
      budget: 4000,
    },
  ],
  controllers: {
    index(req, res) {
      const updatedJobs = Job.data.map((job) => {
        //reajuste do job
        const remaining = Job.services.remainingDays(job);
        const status = remaining <= 0 ? "done" : "progress";

        return {
          ...job,
          remaining,
          status,
          budget: Job.services.calculateBudget(job, Profile.data["value-hour"]),
        };
      });

      return res.render(views + "index", { jobs: updatedJobs });
    },

    save(req, res) {
      //req.body == { name: 'Maratona', 'daily-hours': '4', 'total-hours': '20' }
      const lastId = Job.data[Job.data.length - 1]?.id || 1;

      Job.data.push({
        id: lastId + 1,
        name: req.body.name,
        "daily-hours": req.body["daily-hours"],
        "total-hours": req.body["total-hours"],
        created_at: Date.now(), //atribuindo data de hj
      });
      return res.redirect("/");
      //console.log("\033[1;33m [SALVANDO DADOS]");
    },

    create(req, res) {
      return res.render(views + "job");
    },

    show(req, res) {
      const jobId = req.params.id;

      const job = Job.data.find((job) => Number(job.id) === Number(jobId));

      if (!job) {
        return res.send("Job not found");
      }

      job.budget = Job.services.calculateBudget(
        job,
        Profile.data["value-hour"]
      );

      return res.render(views + "job-edit", { job });
    },

    update(req, res) {
      const jobId = req.params.id;

      const job = Job.data.find((job) => Number(job.id) === Number(jobId));

      if (!job) {
        return res.send("Job not found");
      }

      const updatedJob = {
        ...job,
        name: req.body.name,
        "total-hours": req.body["total-hours"],
        "daily-hours": req.body["daily-hours"],
      };

      Job.data = Job.data.map((job) => {
        if (Number(job.id) === Number(jobId)) {
          job = updatedJob;
        }

        return job;
      });

      res.redirect("/job/" + jobId);
    },

    delete(req, res) {
      const jobId = req.params.id;

      Job.data = Job.data.filter((job) => Number(job.id) !== Number(jobId));

      return res.redirect("/");
    },
  },
  services: {
    remainingDays(job) {
      //calculos de horas
      const remainingDays = (job["total-hours"] / job["daily-hours"]).toFixed();

      const createdDate = new Date(job.created_at);
      const dueDay = createdDate.getDate() + Number(remainingDays);
      const dueDateInMs = createdDate.setDate(dueDay);

      const timeDiffInMs = dueDateInMs - Date.now();
      //transformar milisegundos em dia
      const dayInMs = 1000 * 60 * 60 * 24;
      const dayDiff = Math.floor(timeDiffInMs / dayInMs);

      //retorna a diferenca de dias, quantos dias faltam
      return dayDiff;
    },
    calculateBudget: (job, valueHour) =>
      Profile.data["value-hour"] * job["total-hours"],
  },
};

//response, request (SÃO AS ROTAS)
routes.get("/", Job.controllers.index);
routes.get("/job", Job.controllers.create);
routes.post("/job", Job.controllers.save);
routes.get("/job/:id", Job.controllers.show);
routes.post("/job/:id", Job.controllers.update);
routes.post("/job/delete/:id", Job.controllers.delete);
routes.get("/profile", Profile.controllers.index);
routes.post("/profile", Profile.controllers.update);

/*routes.get("/index.html", (req, res) => {
  return res.redirect("/");
});*/

module.exports = routes;

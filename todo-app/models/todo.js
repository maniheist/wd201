"use strict";
const { Model } = require("sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    static async remove(id) {
      return this.destroy({ where: { id } });
    }

    static async getDueToday() {
      const d = new Date().toLocaleDateString("en-CA");
      const today = await this.findAll({
        where: { dueDate: { [Op.eq]: d }, completed: false },
      });
      return today;
    }

    static async getDueLater() {
      const d = new Date().toLocaleDateString("en-CA");
      const later = await this.findAll({
        where: { dueDate: { [Op.gt]: d }, completed: false },
      });
      return later;
    }

    static async getOverDue() {
      const d = new Date().toLocaleDateString("en-CA");
      const overdue = await this.findAll({
        where: { dueDate: { [Op.lt]: d }, completed: false },
      });
      return overdue;
    }

    static async getCompleted() {
      const complete = await this.findAll({
        where: { completed: true },
      });
      return complete;
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    setCompletionStatus(status) {
      return this.update({ completed: status });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};

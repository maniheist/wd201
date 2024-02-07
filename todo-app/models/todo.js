/* eslint-disable no-undef */
'use strict';
const {
  Model,Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
   
    static associate(models) {
       Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
     static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    static getTodos(userId) {
      return this.findAll({
        where: {
          userId,
        },
      });
    }
    static async overdue(userId) {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          userId,
          completed: false,
        },
      });
    }

    static async dueToday(userId) {
      return await Todo.findAll({
        where: {
          dueDate: {
            // eslint-disable-next-line no-undef
            [Op.eq]: new Date(),
          },
          userId,
          completed: false,
        },
      });
    }

    static async dueLater(userId) {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          userId,
          completed: false,
        },
      });
    }
    setCompletionStatus(bool) {
      return this.update({ completed: bool });
    }

    static async remove(id, userId) {
      return this.destroy({
        where: {
          id: id,
          userId,
        },
      });
    }

    static completed(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
        },
      });
    }
  }
  
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};

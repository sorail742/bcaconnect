const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Quiz optionnel attaché à une ressource éducative (cahier des charges 3.14 —
 * formation interactive). `questions` : tableau JSON de
 * { question, options: [string...], correct_index }. Le `correct_index` ne
 * doit JAMAIS être renvoyé tel quel à un apprenant (voir education.service
 * getQuizForLearner qui le retire avant réponse).
 */
const EducationalQuiz = sequelize.define('EducationalQuiz', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    resource_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    questions: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    passing_score: {
        type: DataTypes.INTEGER,
        defaultValue: 60, // % minimum pour valider le module
    },
}, {
    tableName: 'educational_quizzes',
    underscored: true,
    timestamps: true,
});

module.exports = EducationalQuiz;

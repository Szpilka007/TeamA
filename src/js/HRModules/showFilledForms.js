const pencilPng = require('../../icons/pencil.png');

const { $id } = require('../utils');
const Dialogs = require('../common/dialogs');
const {
    createOpenQuestion, createClosedQuestion, createNumberQuestion, createEvaluationButtons
} = require('../common/form');

const { getFilledFormFromDatabase } = require('../databaseConnector');

const ShowFilledForms = {
    points: [],
    initialized: false,

    init() {
        this.initialized = true;
        this.assignEventListeners();


        getFilledFormFromDatabase().then(str => {
            console.log(str);
            const forms = JSON.parse(str);
            console.log(forms);

            for (const [it, form] of forms.entries()) {
                const div = document.createElement('div');

                let child = document.createElement('div');
                child.innerHTML = (it + 1);
                div.appendChild(child);

                child = document.createElement('div');
                child.innerHTML = form.title;
                div.appendChild(child);

                child = document.createElement('div');
                child.innerHTML = form.owner;
                div.appendChild(child);

                child = document.createElement('div');
                child.innerHTML = form.questions.length;
                div.appendChild(child);

                child = document.createElement('div');

                const img = new Image();
                img.src = pencilPng;
                img.onclick = () => {
                    this.show(form);
                };
                child.appendChild(img);

                div.appendChild(child);

                $id('showFilledForms-list-table').appendChild(div);
            }

            this.showAll();

            $id('showFilledForms-content-loading').remove();
        });
    },

    open() {
        if (!this.initialized)
            this.init();
        else
            this.showAll();
    },

    showAll() {
        $id('showFilledForms-list').style.display = 'block';
        $id('showFilledForms-form').style.display = 'none';
    },

    show(which) {
        this.points = [];
        $id('showFilledForms-list').style.display = 'none';
        $id('showFilledForms-form').style.display = 'block';

        $id('showFilledForms-form-title').innerHTML = `${which.title} - ${which.owner} `;
        $id('showFilledForms-form-content').innerHTML = '';

        for (const [it, question] of which.questions.entries()) {
            this.points.push(null);

            if (question.type.toLowerCase() === 'o') {
                const questionDOM = createOpenQuestion(question.number, question.content);

                const input = questionDOM.querySelectorAll('input')[0];
                input.disabled = true;
                input.value = question.userAnswer;

                $id('showFilledForms-form-content')
                    .appendChild(questionDOM);

                const evaluateButtons = createEvaluationButtons(
                    () => {
                        this.points[it] = true;
                    },
                    () => {
                        this.points[it] = false;
                    }
                );

                $id('showFilledForms-form-content')
                    .appendChild(evaluateButtons);
            } else if (question.type.toLowerCase() === 'w') {
                const questionDOM = createClosedQuestion(question.number,
                    question.content,
                    question.answers);

                const inputs = questionDOM.querySelectorAll('input');
                const labels = questionDOM.querySelectorAll('span');

                const limit = inputs.length;
                for (let i = 0; i < limit; i++) {
                    inputs[i].disabled = true;
                    if (labels[i].innerHTML === question.userAnswer)
                        inputs[i].checked = true;
                }

                $id('showFilledForms-form-content')
                    .appendChild(questionDOM);

                const evaluateButtons = createEvaluationButtons(
                    () => {
                        this.points[it] = true;
                    },
                    () => {
                        this.points[it] = false;
                    }
                );

                $id('showFilledForms-form-content')
                    .appendChild(evaluateButtons);
            } else if (question.type.toLowerCase() === 'l') {
                const questionDOM = createNumberQuestion(question.number, question.content);

                const input = questionDOM.querySelectorAll('input')[0];
                input.disabled = true;
                input.value = question.userAnswer;

                $id('showFilledForms-form-content')
                    .appendChild(questionDOM);

                const evaluateButtons = createEvaluationButtons(
                    () => {
                        this.points[it] = true;
                    },
                    () => {
                        this.points[it] = false;
                    }
                );

                $id('showFilledForms-form-content')
                    .appendChild(evaluateButtons);
            }
        }
    },

    evaluateForm() {
        const isAllChecked = !(this.points.indexOf(null) > -1);

        if (isAllChecked) {
            Dialogs.confirm('Zakończenie',
                'Czy na pewno zakończyć sprawdzanie?',
                () => {
                    // TODO statystyki pytań są w zmiennej points, teraz tylko wysłać do backendu!
                    console.log(this.points);
                    this.showAll();
                });
        } else {
            Dialogs.alert('Uwaga!', 'Nie wszystkie pytania zostały sprawdzone!');
        }
    },

    assignEventListeners() {
        $id('showFilledForms-form-buttons-back')
            .addEventListener('click', () => {
                ShowFilledForms.showAll();
            });

        $id('showFilledForms-form-buttons-apply')
            .addEventListener('click', () => {
                ShowFilledForms.evaluateForm();
            });
    }
};

exports.ShowFilledForms = ShowFilledForms;
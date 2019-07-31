"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInput = (name, message) => {
    return (defaultAnswer) => ({
        type: 'input',
        name,
        message,
        default: defaultAnswer,
    });
};
exports.generateSelect = (name) => {
    return (message) => {
        return (choices) => ({
            type: 'list',
            name,
            message,
            choices,
        });
    };
};

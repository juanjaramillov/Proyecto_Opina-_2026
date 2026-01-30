import { TEMPLATE_BY_CATEGORY, Question } from '../config/surveyTemplates';

export const surveyService = {
    getTemplateByCategory: (category: string): Question[] => {
        return TEMPLATE_BY_CATEGORY[category] || TEMPLATE_BY_CATEGORY['place'];
    }
};

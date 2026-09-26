import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
    CreateQuizQuestionDto,
    CreateQuizOptionDto,
} from './create-quiz.dto';

describe('CreateQuizQuestionDto', () => {
    const createOption = (
        optionText: string,
        isCorrect = false,
    ): CreateQuizOptionDto => ({
        optionText,
        isCorrect,
    });

    it('should accept exactly 4 options', async () => {
        const dto = plainToInstance(CreateQuizQuestionDto, {
            question: 'What is the normal adult resting heart rate?',
            options: [
                createOption('60–100 bpm', true),
                createOption('20–40 bpm'),
                createOption('120–160 bpm'),
                createOption('160–200 bpm'),
            ],
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('should accept exactly 5 options', async () => {
        const dto = plainToInstance(CreateQuizQuestionDto, {
            question: 'Which organ pumps blood throughout the body?',
            options: [
                createOption('Heart', true),
                createOption('Liver'),
                createOption('Kidney'),
                createOption('Lung'),
                createOption('Pancreas'),
            ],
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('should reject fewer than 4 options', async () => {
        const dto = plainToInstance(CreateQuizQuestionDto, {
            question: 'Which organ pumps blood throughout the body?',
            options: [
                createOption('Heart', true),
                createOption('Liver'),
                createOption('Kidney'),
            ],
        });

        const errors = await validate(dto);

        expect(errors.some((error) => error.property === 'options')).toBe(true);
    });

    it('should reject more than 5 options', async () => {
        const dto = plainToInstance(CreateQuizQuestionDto, {
            question: 'Which organ pumps blood throughout the body?',
            options: [
                createOption('Heart', true),
                createOption('Liver'),
                createOption('Kidney'),
                createOption('Lung'),
                createOption('Pancreas'),
                createOption('Spleen'),
            ],
        });

        const errors = await validate(dto);

        expect(errors.some((error) => error.property === 'options')).toBe(true);
    });
});
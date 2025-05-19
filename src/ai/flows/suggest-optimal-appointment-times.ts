'use server';

/**
 * @fileOverview Suggests optimal times for scheduling new appointments based on past scheduling data.
 *
 * - suggestOptimalAppointmentTimes - A function that suggests optimal appointment times.
 * - SuggestOptimalAppointmentTimesInput - The input type for the suggestOptimalAppointmentTimes function.
 * - SuggestOptimalAppointmentTimesOutput - The return type for the suggestOptimalAppointmentTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalAppointmentTimesInputSchema = z.object({
  userId: z.string().describe('The ID of the user scheduling the appointment.'),
  appointmentDurationMinutes: z
    .number()
    .describe('The duration of the appointment in minutes.'),
  appointmentDate: z
    .string()
    .describe('The date for which to suggest appointment times (ISO format).'),
  userPreferences: z
    .string()
    .optional()
    .describe('Any user preferences for scheduling appointments.'),
});
export type SuggestOptimalAppointmentTimesInput = z.infer<
  typeof SuggestOptimalAppointmentTimesInputSchema
>;

const SuggestOptimalAppointmentTimesOutputSchema = z.object({
  suggestedTimes: z
    .array(z.string())
    .describe('An array of suggested appointment times (ISO format).'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested appointment times.'),
});
export type SuggestOptimalAppointmentTimesOutput = z.infer<
  typeof SuggestOptimalAppointmentTimesOutputSchema
>;

export async function suggestOptimalAppointmentTimes(
  input: SuggestOptimalAppointmentTimesInput
): Promise<SuggestOptimalAppointmentTimesOutput> {
  return suggestOptimalAppointmentTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalAppointmentTimesPrompt',
  input: {schema: SuggestOptimalAppointmentTimesInputSchema},
  output: {schema: SuggestOptimalAppointmentTimesOutputSchema},
  prompt: `You are an AI assistant that suggests optimal appointment times for a user.

You have access to the user's past scheduling data and preferences.

Based on this information, suggest a few optimal appointment times for the user on the specified date.
Consider the appointment duration and any user preferences.

User ID: {{{userId}}}
Appointment Date: {{{appointmentDate}}}
Appointment Duration (minutes): {{{appointmentDurationMinutes}}}
User Preferences: {{{userPreferences}}}

Respond with a list of suggested appointment times in ISO format and the reasoning behind your suggestions.`,
});

const suggestOptimalAppointmentTimesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalAppointmentTimesFlow',
    inputSchema: SuggestOptimalAppointmentTimesInputSchema,
    outputSchema: SuggestOptimalAppointmentTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

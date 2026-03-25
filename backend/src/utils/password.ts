import bcrypt from 'bcrypt';

export const DEFAULT_PASSWORD = 'Str0ngP@ssword';

export const getHashedDefaultPassword = async (): Promise<string> => {
  return await bcrypt.hash(DEFAULT_PASSWORD, 10);
};

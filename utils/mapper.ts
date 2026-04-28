// utils/mapper.ts

/**
 * Maps database row to API response
 * Ensures _id is present for frontend compatibility
 */
export const mapDbToApi = <T extends Record<string, any>>(row: T) => {
  if (!row) return row;
  return {
    ...row,
    _id: row.id,
  };
};

/**
 * Maps API request body to database row
 * Ensures id is set from _id
 */
export const mapApiToDb = <T extends Record<string, any>>(body: T) => {
  if (!body) return body;
  const { _id, ...rest } = body;
  return {
    ...rest,
    id: _id !== undefined ? _id : rest.id,
  };
};

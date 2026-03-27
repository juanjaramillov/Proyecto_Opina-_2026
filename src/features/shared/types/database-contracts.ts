import { Database as OriginalDatabase } from '../../../supabase/database.types';
import { DatabaseManualOverrides } from './database-manual-overrides';

export type StrictDatabase = {
  graphql_public: OriginalDatabase['graphql_public'];
  public: {
    Tables: Omit<OriginalDatabase['public']['Tables'], keyof DatabaseManualOverrides['Tables']> &
      DatabaseManualOverrides['Tables'];
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
};

// Expose standard Database equivalent
export type Database = StrictDatabase;

export type PublicSchema = StrictDatabase['public'];

export type TableRow<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TableInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TableUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];

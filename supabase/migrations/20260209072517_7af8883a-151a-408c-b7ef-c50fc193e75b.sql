-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for comment count updates  
DROP TRIGGER IF EXISTS update_comments_count_trigger ON public.comments;
CREATE TRIGGER update_comments_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comments_count();

-- Create trigger for reaction count updates
DROP TRIGGER IF EXISTS update_reactions_count_trigger ON public.reactions;
CREATE TRIGGER update_reactions_count_trigger
  AFTER INSERT OR DELETE ON public.reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reactions_count();

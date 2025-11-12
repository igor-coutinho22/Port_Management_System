namespace WebApp.Security
{
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string Operator = "Operator";
        public const string Officer = "Officer";
        public const string Representative = "Representative";

        // helpers
        public static readonly string[] All = { Admin, Operator, Officer, Representative };
        public static readonly string[] Ops = { Admin, Operator, Officer }; 
    }
}

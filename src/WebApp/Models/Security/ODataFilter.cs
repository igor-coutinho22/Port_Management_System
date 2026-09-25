namespace WebApp.Models.Security;

public static class ODataFilter
{
    // Escapes a value for use inside an OData string literal (e.g. Microsoft Graph $filter)
    public static string Escape(string value) => value.Replace("'", "''");
}

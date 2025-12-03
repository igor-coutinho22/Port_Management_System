using Xunit;

[CollectionDefinition("WebApp Factory Collection")]
public class WebAppFactoryCollection : ICollectionFixture<TestWebAppFactory>
{
    // This class has no code, it just tells xUnit to use one shared TestWebAppFactory for all tests in this collection"
}

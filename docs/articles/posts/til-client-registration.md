---
draft: false
date: 2025-03-05
authors:
  - cameronpresley
description: >
  TIL - Auto Configuring HttpClient

categories:
  - Dotnet
  - Today I Learned

hide:
  - toc
---

# Today I Learned: Configuring HttpClient via Service Registration


When integrating with an external service via an API call, it's common to create a class the encapsulates dealing with the API. For example, if I was interacting with the GitHub API, I might create a C# class that wraps the `HttpClient`, like the following:

```csharp
public interface IGitHubService
{
    Task<string> GetCurrentUsername();
}

public class GitHubService : IGitHubService
{
    private readonly HttpClient _client;
    public GitHubService(HttpClient client)
    {
        _client = client;
    }
    public async Task<string> GetCurrentUsername()
    {
        // code implementation
    }
}

```

## Repetition of Values

This is a great start, but over time, your class might end up like the following:

```csharp
public class GitHubService
{
    private readonly HttpClient _client;
    public GitHubService(HttpClient client)
    {
        _client = client;
    }
    public async Task<string> GetCurrentUsername()
    {
        var result = _client.GetFromJsonAsync("https://api.github.com/user")
        return result.Login;
    }
    public async Task<List<string>> GetAllUsers()
    {
        var result = _client.GetFromJsonAsync("https://api.github.com/users");
        return result.Select(x => x.Login).ToList();
    }
    public async Task<List<string>> GetTeamNamesForOrg(string org)
    {
        var result = _client.GetFromJsonAsync($"https://api.github.com/orgs/{org}/teams");
        return result.Select(x => x.Name).ToList();
    }
}
```

Right off the bat, it seems like we're repeating the URL for each method call. To remove the repetition, we could extract to a constant.

```csharp
public class GitHubService
{
    private readonly HttpClient _client;
    // Setting the base URL for later usage
    private const string _baseUrl = "https://api.github.com";
    public GitHubService(HttpClient client)
    {
        _client = client;
    }
    public async Task<string> GetCurrentUsername()
    {
        var result = _client.GetFromJsonAsync($"{_baseUrl}/user")
        return result.Login;
    }
    public async Task<List<string>> GetAllUsers()
    {
        var result = _client.GetFromJsonAsync($"{_baseUrl}/users");
        return result.Select(x => x.Login).ToList();
    }
    public async Task<List<string>> GetTeamNamesForOrg(string org)
    {
        var result = _client.GetFromJsonAsync($"{_baseUrl}/orgs/{org}/teams");
        return result.Select(x => x.Name).ToList();
    }
}
```

This helps remove the repetition, however, we're now keeping track of a new field, `_baseUrl`. Instead of using this, we could leverage the [`BaseAddress`](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient.baseaddress?view=net-9.0) property and set that in the service's constructor.

```csharp

public class GitHubService
{
    private readonly HttpClient _client;
    public GitHubService(HttpClient client)
    {
        _client = client;
        _client.BaseAddress = "https://api.github.com"; // Setting the base address for the other requests.
    }
    public async Task<string> GetCurrentUsername()
    {
        var result = _client.GetFromJsonAsync("/user")
        return result.Login;
    }
    public async Task<List<string>> GetAllUsers()
    {
        var result = _client.GetFromJsonAsync("/users");
        return result.Select(x => x.Login).ToList();
    }
    public async Task<List<string>> GetTeamNamesForOrg(string org)
    {
        var result = _client.GetFromJsonAsync($"/orgs/{org}/teams");
        return result.Select(x => x.Name).ToList();
    }
}

```

I like this refactor because we remove the field and we have our configuration in one spot. That being said, interacting with an API typically requires more information than just the URL. For example, setting up the API token or that we're always expecting JSON for the response. We could add the header setup in each method, but that seems quite duplicative.

## Leveraging Default Request Headers

We can centralize our request headers by leveraging the [`DefaultRequestHeaders` property](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient.defaultrequestheaders?view=net-9.0) and updating our constructor.

```csharp

public class GitHubService
{
    private readonly HttpClient _client;
    public GitHubService(HttpClient client)
    {
        _client = client;
        _client.BaseAddress = "https://api.github.com";
        _client.DefaultRequestHeaders.Add("Accept", "application/vnd.github+json");
        _client.DefaultRequestHeaders.Add("Authentication", $"Bearer {yourTokenGoesHere}");
        _client.DefaultRequestHeaders.Add("X-GitHub-Api-Version", "2022-11-28");
    }
    public async Task<string> GetCurrentUsername()
    {
        var result = _client.GetFromJsonAsync("/user")
        return result.Login;
    }
    public async Task<List<string>> GetAllUsers()
    {
        var result = _client.GetFromJsonAsync("/users");
        return result.Select(x => x.Login).ToList();
    }
    public async Task<List<string>> GetTeamNamesForOrg(string org)
    {
        var result = _client.GetFromJsonAsync($"/orgs/{org}/teams");
        return result.Select(x => x.Name).ToList();
    }
}

```

I like this refactor because all of our configuration of the service is right next to how we're using it, so easy to troubleshoot. At this point, we would need to register our service in the Inversion of Control (IoC) container and then everything would work.

Generally, you'll find this in `Startup.cs` and would look like:

```csharp

services.AddTransient<IGitHubService, GitHubService>();

```

## An Alternative Approach for Service Registration

However, I learned that when you're building a service that's wrapping an `HttpClient`, there's another service registration method you could use, `AddHttpClient` with the [_Typed Client_ approach](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/http-requests?view=aspnetcore-9.0#typed-clients).

Let's take a look at what this would look like.

```csharp

// In Startup.cs

services.AddHttpClient<IGitHubService, GitHubService>(client => {
    client.BaseAddress = new Uri("https://api.github.com");
    client.DefaultRequestHeaders.Add("Accept", "application/vnd.github+json");
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiTokenGoesHere}");
    client.DefaultRequestHeaders.Add("X-GitHub-Api-Version", "2022-11-28");
});

```

We've essentially moved our configuration logic from the `GitHubService` to the IoC container, simplifying the service.

```csharp

public class GitHubService : IGitHubService
{
    private readonly HttpClient _client;
    public GitHubService(HttpClient client)
    {
        _client = client;
    }
    public async Task<string> GetCurrentUsername()
    {
        var result = _client.GetFromJsonAsync("/user")
        return result.Login;
    }
    public async Task<List<string>> GetAllUsers()
    {
        var result = _client.GetFromJsonAsync("/users");
        return result.Select(x => x.Login).ToList();
    }
    public async Task<List<string>> GetTeamNamesForOrg(string org)
    {
        var result = _client.GetFromJsonAsync($"/orgs/{org}/teams");
        return result.Select(x => x.Name).ToList();
    }
}

```

## My Thoughts

Even though this is a new approach, I'm kind of torn if I like it or not. On one hand, I appreciate that we can centralize the logic in one spot so that everything for the `GitHubService` is one spot. However, if we needed other dependencies to configure the service (for example, we needed to get the bearer token from `AppSettings`), I could see this getting a bit more complicated, though contained.

On the other hand, we could shift all that config to the IoC and let it deal with that. It definitely streamlines the `GitHubService` so we can focus on the endpoints and their logic, however, now I've got to look for two spots to see where the client is being configured.


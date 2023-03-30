---
draft: false
date: 2015-10-28
authors: 
  - cameronpresley
description: >
  How to check if a substitute was called zero times

categories:
  - Today I Learned

hide:
  - toc
---

# TIL – How To Check If a Substitute Was Called Zero Times

## Setup

During this past week, I’ve been working on a new feature and during development, I ended up with code that looked like this:

```csharp
public class PermissionChecker
{
  public PermissionChecker(IModuleDisabler moduleDisabler, User user)
  {
      if (user.IsAdmin) return;
      else if (user.HasFullRights) ConfigureFullRights(moduleDisabler);
      else if (user.HasPartialRights) ConfigurePartialRights(moduleDisabler);
  }

  private void ConfigureFullRights(IModuleDisabler disabler)
  {
      disabler.DisableSystemAdminModule();
  }

  private void ConfigurePartialRights(IModuleDisabler disabler)
  {
      disabler.DisableSystemAdminModule();
      disabler.DisableReportModule();
      disabler.DisableUserManagementModule();
  }
}
```

So the code is pretty straight forward, I have a **PermissionChecker** whose job is to use the **IModuleDisabler** to turn off certain modules depending upon the user permissions. Pretty straightforward implementation.

Now that the solution is fleshed out, it’s time to write some tests around this. When it comes to testing classes that have dependencies on non-trivial classes, I use [NSubstitute](https://nsubstitute.github.io/), a mocking tool, to create mock versions of those dependencies. In this case, NSubstitute allows me to test how the **IModuleDisabler** is being used by the **PermissionsChecker**.

For example, let’s say that I wanted to test how the **PermissionChecker** interacts with the **IModuleDisabler** when the user has a partial access, I’d write a test that looks like the following:

```csharp
[Test]
public void And_the_user_has_partial_access_then_the_disabler_disables_the_report_module()
{
     // Arrange
     var permissionChecker = new PermissionChecker();
     var mockDisabler = Substitute.For();
     var user = new User {HasPartialAccess = true};

     // Act
     permissionChecker.CheckPermissions(mockDisabler, user);

     // Assert
     mockDisabler.Received(1).DisableReportModule();
}
```

In the above test, our assertion step is to check if the **mockDisabler** received a single call to the **DisableReportModule**. If it didn’t receive a call, then the test fails. We can write similar tests for the different modules that should be disabled for the partial rights permission and follow a similar pattern for the full rights permission.

However, things get a bit more interesting when we’re testing what happens if the user is an admin. If we follow the same pattern, we’d end up with a test that looks like this:

```csharp
[Test]
public void And_the_user_has_admin_permissions_then_the_disabler_is_not_used()
{
     // Arrange
     var permissionChecker = new PermissionChecker();
     var mockDisabler = Substitute.For();
     var user = new User {IsAdmin = true};

     // Act
     permissionChecker.CheckPermissions(mockDisabler, user);

     // Assert
     mockDisabler.DidNotReceive().DisableSystemAdminModule();
     mockDisabler.DidNotReceive().DisableReportModule();
     mockDisabler.DidNotReceive().DisableUserManagementModule();
}
```

This solution works for now, however, there is a major maintainability issue, can you spot it?

## Problem

The issue arises when we add a new module to be disabled which forces the **IModuleDisabler** to implement a new method. In that case, you need to remember to update this test to also check that the new method wasn’t being called. If you forget, this test would still pass, but it’d pass for the wrong reason.

To help illustrate, let’s say that another method, **DisableImportModule**, has been added to the **IModuleDisabler** interface. In addition, we also need to make sure that this is called when users have partial access, but should not be called for users who are admins or users who have full access.

To fulfill those requirements, we modify the **PermissionChecker** as so:

```csharp
public class PermissionChecker
{
  public PermissionChecker(IModuleDisabler moduleDisabler, User user)
  {
      if (user.IsAdmin) return;
      else if (user.HasFullRights) ConfigureFullRights(moduleDisabler);
      else if (user.HasPartialRights) ConfigurePartialRights(moduleDisabler);
  }

  private void ConfigureFullRights(IModuleDisabler disabler)
  {
      disabler.DisableSystemAdminModule();
  }

  private void ConfigurePartialRights(IModuleDisabler disabler)
  {
      disabler.DisableSystemAdminModule();
      disabler.DisableReportModule();
      disabler.DisableUserManagementModule();
      disabler.DisableImportModule();
  }
}
```

At this point, we’d write another test for when the a user has partial access, the import module should be disabled. However, it’s very unlikely that we’d remember to update the test for the admin. Remember, for the admin, we’re checking that it received no calls to any disable methods and the way we’re doing that is by checking each method individually.

```csharp
[Test]
public void And_the_user_has_admin_permissions_then_the_disabler_is_not_used()
{
  // Arrange
  var permissionChecker = new PermissionChecker();
  var mockDisabler = Substitute.For();
  var user = new User {IsAdmin = true};

  // Act
  permissionChecker.CheckPermissions(mockDisabler, user);

  // Assert
  mockDisabler.DidNotReceive().DisableSystemAdminModule();
  mockDisabler.DidNotReceive().DisableReportModule();
  mockDisabler.DidNotReceive().DisableUserManagementModule();
  // Need to add check for DidNotReceive().DisableImportModule();
}
```

## Solution
There’s got to be a better way. After some digging around, I found that any NSubstitute mock, has a **ReceivedCalls** method that returns all calls that the mock received. With this new knowledge, we can refactor the previous test with the following:

```csharp
[Test]
public void And_the_user_has_admin_permissions_then_the_disabler_is_not_used()
{
  // Arrange
  var permissionChecker = new PermissionChecker();
  var mockDisabler = Substitute.For();
  var user = new User {IsAdmin = true};

  // Act
  permissionChecker.CheckPermissions(mockDisabler, user);

  // Assert
  CollectionAssert.IsEmpty(mockDisabler.ReceivedCalls());
}
```

This solution is much better because if we add more modules, this test is still checking to make sure that admin users do not have any modules disabled.

## Summary

When using a NSubstitute mock and you need to make sure that it received no calls to any methods or properties, you can using NSubstitute’s **ReceivedCalls** in conjunction with **CollectionAssert.IsEmpty** to ensure that the substitute was not called.
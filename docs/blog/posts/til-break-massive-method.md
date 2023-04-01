---
draft: false
date: 2014-12-22
authors: 
  - cameronpresley
description: >
  Learning how to break down a method

categories:
  - Today I Learned

hide:
  - toc
---

# Today I Learned – How to Break Down A Massive Method

During this past week, I was working with our intern and showing him some cool debugging tricks when I came across a massive method. I gave him 30 seconds to look at it and tell me what he thought the method was doing. After a while, he was able to figure it out, but the fact that it wasn’t easy discernible was enough to give pause.

The lesson here is that if you can’t determine what the method is doing easily, then it’s probably doing way too much (violating the [Single Responsibility Principle](./establish-solid-single.md)) and needs to be broken into more easily readable pieces.

To demonstrate what I mean, I wrote a program that inserts Messages into a database. A Message contains a description, the number (for identification when troubleshooting) and the module. We would have issues where different messages would have the same number which would cause confusion when troubleshooting errors.

In the program I wrote, the user provides the message and what module the message belongs to and the program automatically generates the message number and inserts the message into the database.

For brevity’s sake, shown below is the logic for determining what the next message number should be.

```csharp
public int GetNextAlertAndErrorModuleNumber(string module)
{
  if (String.IsNullOrEmpty(module))
    throw new ArgumentException("module cannot be null or empty");
  if (_connection == null)
    _connection = CreateConnection();

  var results = new List<int>();

  _connection.Open();
  var cmd = new SqlCommand("dbo.GetAlertData", _connection);
  cmd.CommandType = CommandType.StoredProcedure;

  var reader = cmd.ExecuteReader();
  while (reader.Read())
  {
    if (!reader["ALERT_ID_NUMBER"].ToString().Contains(module))
      continue;

    var pieces = reader["ALERT_ID_NUMBER"].ToString().Split(‘ ‘);

    results.Add(Int32.Parse(pieces[1]));
  }
  if (reader != null)
    reader.Close();

  cmd = new SqlCommand("dbo.GetErrorData";, _connection);
  cmd.CommandType = CommandType.StoredProcedure;

  reader = cmd.ExecuteReader();
  while (reader.Read())
  {
    if (!reader["ERROR_ID_NUMBER"].ToString().Contains(module))
      continue;

    var pieces = reader["ERROR_ID_NUMBER"].ToString().Split(‘ ‘);

    results.Add(Int32.Parse(pieces[1]));
  }
  if (reader != null)
    reader.Close();

  if (_connection != null)
    _connection.Close();

  return results.Max() + 1;
}
```

The method itself isn’t complex, just calling some stored procedures, parsing the output and adding the number to a list. However, it’s not abundantly clear what the purpose of the calling the stored procedures.

First, it looks like we’re reading the alerts error numbers from a stored procedure call, why don’t we extract that logic out to a helper method and have the public method call the helper?

```csharp hl_lines="12 36"

public int GetNextAlertAndErrorModuleNumber(string module)
{
  if (String.IsNullOrEmpty(module))
    throw new ArgumentException(&amp;amp;quot;module cannot be null or empty&amp;amp;quot;);

  if (_connection == null)
    _connection = CreateConnection();

  var results = new List<int>();

  _connection.Open();
  results.AddRange(ReadAlerts(module.ToUpper()));

  var cmd = new SqlCommand("dbo.GetErrorData", _connection);
  cmd.CommandType = CommandType.StoredProcedure;

  var reader = cmd.ExecuteReader();
  while (reader.Read())
  {
    if (!reader["ERROR_ID_NUMBER"].ToString().Contains(module))
      continue;

    var pieces = reader["ERROR_ID_NUMBER&"].ToString().Split(‘ ‘);

    results.Add(Int32.Parse(pieces[1]));
  }
  if (reader != null)
    reader.Close();

  if (_connection != null)
    _connection.Close();

  return results.Max() + 1;
  }

  private List<int> ReadAlerts(string module)
  {
    var results = new List<int>();
    var cmd = new SqlCommand("dbo.GetAlertData", _connection);
    cmd.CommandType = CommandType.StoredProcedure;

    var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
      if (!reader["ALERT_ID_NUMBER"].ToString().Contains(module))
        continue;

      var pieces = reader["ALERT_ID_NUMBER"].ToString().Split(‘ ‘);
      results.Add(Int32.Parse(pieces[1]));
    }
    if (reader != null)
    reader.Close();

    return results;
}
```

By doing this, we fix two issues at once. First, we’ve given a name to the process of reading the alerts which in turns allows us to quickly understand what the public method should be doing (i.e. improved readability).

Second, it allows us for easier debugging because we now have smaller components. For example, let’s say that we were getting the wrong value. In the first implementation, we would have to put breakpoints in different areas trying to determine which part was broken. However, in the new form, we can check to see if ReadAlerts is behaving correctly. If it isn’t, we now know the bug has to be in that method, otherwise, it’s in the rest.

For the next step, you may have noticed that we can repeat the same refactoring trick again, except this time, we can extract the logic for reading the errors into a helper method.

```csharp hl_lines="11 12"
public int GetNextAlertAndErrorModuleNumber(string module)
{
  if (String.IsNullOrEmpty(module))
    throw new ArgumentException("module cannot be null or empty");
  if (_connection == null)
    _connection = CreateConnection();

  _connection.Open();

  var results = new List<int>();
  results.AddRange(ReadAlerts(module.ToUpper()));
  results.AddRange(ReadErrors(module.ToUpper()));

  if (_connection != null)
    _connection.Close();

  return results.Max() + 1;
}

private List<int> ReadAlerts(string module)
{
  var results = new List<int>();
  var cmd = new SqlCommand("dbo.GetAlertData", _connection);
  cmd.CommandType = CommandType.StoredProcedure;

  var reader = cmd.ExecuteReader();
  while (reader.Read())
  {
    if (!reader["ALERT_ID_NUMBER"].ToString().Contains(module))
      continue;

    var pieces = reader["ALERT_ID_NUMBER"].ToString().Split(‘ ‘);
    results.Add(Int32.Parse(pieces[1]));
  }
  if (reader != null)
    reader.Close();

  return results;
}

private List<int> ReadErrors(string module)
{
  var results = new List<int>();
  var cmd = new SqlCommand("dbo.GetErrorData", _connection);
  cmd.CommandType = CommandType.StoredProcedure;

  var reader = cmd.ExecuteReader();
  while (reader.Read())
  {
    if (!reader["ERROR_ID_NUMBER"].ToString().Contains(module))
      continue;

    var pieces = reader["ERROR_ID_NUMBER"].ToString().Split(‘ ‘);
    results.Add(Int32.Parse(pieces[1]));
  }
  if (reader != null)
    reader.Close();

  return results;
}
```

After the changes, anyone who looks at the public API can easily see that it’s reading from both Alerts and Errors. This is really powerful because now you can communicate with non-technical people about requirements and what the code is doing.

Let’s say that in the future, the requirements change and this conversation plays out:

> Alice (QA, finding an error) – Hey Bob, I was running one of our test plans and it looks like that we’re getting the wrong message number if we’re trying to add a new message and there are warning messages in the database. We are including the warning table when figuring that out, right?

> Bob (Engineer, finding the root cause) – Hey you’re right, it looks like we’re only using the alerts and error tables when calculating the next number. Why don’t we write up a ticket for that and get a fix in?

The key point is that no matter how large a method is, there always have to be steps being performed in some order (by definition of an algorithm) and this is the key to refactoring larger methods into more maintainable pieces of code. The trick is determining what those steps are and making decisions on whether to make helper methods or helper classes.

If those steps become complicated, then they should be broken out into helper methods. As time progresses and those helper methods start to become more complicated, then those helper methods should in turn become classes of their own.
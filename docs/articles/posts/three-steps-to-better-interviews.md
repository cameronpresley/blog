---
draft: false
date: 2023-04-09
authors:
  - cameronpresley
description: >
  Three Steps to Better Interviews

categories:
  - Interviewing

hide:
  - toc
---

# Three Steps to Better Interviews

At some point in your career, you're going to be conducting interviews. Regardless of the role, you have the opportunity to shape the future of the company as your recommendation controls whether this person is going to be a colleague or not.

What a lot of people don't realize is that an interview is can be the first experience that someone has with your company. As such, you want this experience to be fantastic, even if they're not hired, as they could be a future customer of yours.

With interviewing to be so important (there are whole books about the subject), it's confounding to me when companies don't invest in training or resources to help grow their leaders into being better interviewers. Especially, when making a bad hire can cause so much damage and is expensive to resolve in the long run.

Over my career, I've seen my share of good and bad interviews and have some tips and tricks to improve your interviewing skills. In this post, I'm going to share three tips that help me have better conversations with candidates.

## 1. Build Better Conversations Using Scenarios

The first mistake I seen interviewers make is that they have a set of questions that they want to pepper the candidate with, in an effort to figure out if they're going to be a good fit or not.

An ideal interview should flow more like a conversation where the candidate is getting to know you and the company and where you are learning about the candidate. As such, a never-ending list of questions makes the candidate feel like they're being interrogated and it doesn't allow for a natural conversation. A great interview should feel like tennis, each player receiving and sending the ball to the other side.

For example, let's say that I want to know a candidates familiarity with [REST APIs](https://restfulapi.net/). I could ask questions like

!!! quote ""
    What's the difference between GET and POST?
    
!!! quote ""
    What's the difference between a 404 and 400 response code?

Even though I'll get answers, this is not much of a conversation, but more of a quiz. Instead, I ask the following

!!! quote ""
    In this scenario, I'm a newer engineer sitting down to make some changes to one of your APIs and I seem to be running into some issues.

    For example, when I invoke the endpoint via GET, I'm getting back a 404 (Not Found). Doing some digging, it seems like it's related to the resource not being there, but I'm not sure how to troubleshoot. What would you recommend?

With the above, the candidate has a clear problem (e.g. can't communicate with the API) and has plenty of space to talk about what they're thinking (incorrect route, API not running, etc..). As the candidate is talking things through, I'm getting more insight on what they know and how they think about things. For example, if they mention that a firewall could be blocking the request, I could dig into that a bit more and learn that they have knowledge in networking or cloud technologies.

Another advantage of this approach is that we can add more steps. For example, here's one of the scenarios I ask to measure understanding of REST APIs.

!!! quote ""
    In this scenario, I'm a newer engineer sitting down to make some changes to one of your APIs and I seem to be running into some issues.

    For example, when I invoke the endpoint via GET, I'm getting back a 404 (Not Found). Doing some digging, it seems like it's related to the resource not being there, but I'm not sure how to troubleshoot. What would you recommend?

    I've fixed the typo, made another request, and I'm now getting a 401 (Unauthorized). Looking up the response code, this implies that I don't have permissions, but I'm stuck on next steps. What would you recommend for troubleshooting?

    Oh right, Bearer Token, I remember reading that in the README, but I didn't understand at the time. After generating the token and making another request, I'm now getting a 400 (Bad Request). Looking up the status code, it seems like it's something related to the payload or route. How would you troubleshoot?

    Finally! After fixing that issue, I was able to get a 200 (Ok) response back, thanks for the help!

By using the above scenario, I can learn quite a bit about what systems an engineer has worked with, what gaps they might have, and how they troubleshoot issues. This is a lot more effective than knowing if an engineer can tell the difference between GET and POST.

## 2. Build Better Conversations Using Open-Ended Questions

Another common mistake I see is asking [closed-ended questions](https://en.wikipedia.org/wiki/Closed-ended_question) to gauge knowledge. Even though these are binary in nature (_Yes/No_) or have a specific answer (_What's the capital of North Carolina?_), they come off as interogative instead of conversational. In addition, these types of questions are informational and could easily be looked up, where as open-ended questions are opinion based and come from experience.

For example, if we were to ask:

!!! quote ""
    What's the difference between an Observable and a Promise?

We would know if the candidate knows the difference or not and that's about it. Even though this knowledge is helpful, we could learn this (and more) by rephrasing it to be open-ended instead.

For example, if we were to ask:

!!! quote ""
    When would you use an Observable over a Promise?

With this question, not only do we learn if the candidate can talk about Observable vs Promise, but we also know if they know which scenarios to use one over the other.

For more effective questions, we could turn this question into a scenario, by asking the following

!!! quote ""
    Let's say that we're working on a web component that has to call an API to get some data. It looks like we could call the API and have the value returned be either an Observable or a Promise. What would you recommend and why?

In this scenario, we get to learn if the candidate knows the differences between Observable and Promise, can reason about why one approach would be better than another, and explain that to another engineer. No matter their choice, we could follow up by asking why they wouldn't pick the other one option.

## 3. Build Better Conversations By Asking For Examples

For the final mistake, I see interviewers ask some form of a [leading question](https://en.wikipedia.org/wiki/Leading_question), where based on the phrasing of the question, the candidate would be pressured or coerced into answering a particular way.

For example

!!! quote ""
    This position involves mentoring interns to be associate engineers. Is that something you're comfortable with?

This is a _leading question_ because if the candidate were to say "No", then they would believe that they wouldn't get the job. So they would always answer yes, regardless of how they feel, which makes this question useless as it doesn't tell us anything about the candidate. Most leading questions tend to also be close-ended questions, so a double strike for this style of interviewing.

_But Cameron! I need to know this information as this person would be responsible for coaching up our engineers!_ Cool, then let's tell the candidate, but let's also provide some context and allow them to tell us their experience.

For example, we could phrase the question this way

!!! quote ""
    One of the responsibilities for the role is to help grow interns into associate engineers so we can grow terrific engineers internally. With this context, can you walk us through a time where you had to coach someone up? What was your approach? What would you do differently?

With this question, you've still mentioned the skill you're looking for, however, you've added context on the "why" behind the question and you've set the candidate up to talk about their experience, which in turn, gives you more context about the person.

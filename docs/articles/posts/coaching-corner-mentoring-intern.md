---
draft: false
date: 2023-06-08
authors:
  - cameronpresley
description: >
  Cameron's Coaching Corner - Mentoring an Intern
categories:
  - Coaching Corner
  - Career
hide:
  - toc
---

# Cameron's Coaching Corner - Mentoring an Intern

Welcome to Cameron's Coaching Corner, where we answer questions from readers about leadership, career, and software engineering.

In this week's post, we look at how `test123` can improve the mentoring experience for their new intern.

!!! quote ""
    I recently had an intern join my time and I’m going to be his mentor. I’ve had interns in the past, but this one doesn’t understand any fundamentals and struggles with everything.

    My question to you is this, how can I help him? He doesn’t know HTML/CSS/JS, so I’m trying to teach him those, but it’s taking away a lot of time. I suggested for him to watch some videos and then we can sync twice a day to go over the topics and discuss them further.

    My issue: I don’t want to just say “go watch videos.” Bc, that’s not the best way to learn - I want him to dive into the code and try things and break, that’s how I learned at least.

    How do you think I should handle this? I wanna be a good mentor and I want him to learn and grow. I don’t wanna fail the kid bc I don’t know the proper way to mentor.

<!-- more -->

First, thank you for caring about your intern and wanting to do right by them. It might not seem like it right now, but you're playing a critical role in helping them succeed.

I think you're wise not to put them in front of videos for learning everything and using that as coaching, a la Matrix style.

<figure markdown>
![I know Kung-Fu](../images/coaching-corner/know-kunfu.jpg)
<figcaption>I know <strike>Kung Fu</strike> Web Development</figcaption>
</figure>

The main issue with this approach is that your intern isn't just leveling up on knowledge, but they're learning a new _skill_, and this can't be picked up by just watching videos. They need to do the work through practice, receiving feedback, and iterating.

For example, I started woodworking a few years back and watched tons of videos on using certain tools and techniques. But until I got into the shop and started building, all I had was theory, no application. What leveled up my skills was putting the time in and building shop projects and critiquing what I did well and not so well.

Learning software development is similar to learning woodworking because there are a lot of tools and techniques out there, but we can't learn it all at once, we need to simplify. In my case, I learned how to build a box. It's the foundation for most woodworking, and the skills to make one apply to almost any other project.

Let's move from woodworking back to software development. I think teaching someone HTML, CSS, and JavaScript all at once is going to lead to them feeling overwhelmed, especially since CSS and JavaScript have a ton of tooling and options available. So, let's narrow the scope.

## What to Focus On?

For me, an internship is successful if they have a solid grasp of the fundamentals of engineering and they shipped meaningful work to production (ideally multiple times). In addition, I want to ensure their knowledge is transferrable (e.g., teaching them some internal library is cool, but since other companies aren't using it, their knowledge gained here is minimal). With that in mind, here's the approach I'd take.

### Source Control

Without having a basic understanding of source control, it's hard to establish a foundation to build other skills on. For example, how would they undo their changes, share their code easily with others, or review others' work? We don't need them to become a Git guru. However, they need to be able to do the following.

- Clone
- Create branch
- Commit changes
- Push changes
- Create a pull request
- Merge a pull request
- Pull changes

If they can complete the above steps, they know enough to complete development work. The cool thing here is that you don't have to spend much time on this, as the projects they'll be working on will build this habit into them. 

I don't care how they do this (whether through the command line or a GUI); the important thing is that they know how to do it. I have a cheat sheet I give them so that if they're using the command line, they can get going quickly.

### Pick a Technology

Instead of teaching them everything at once, let's have them focus on one piece of technology. But which one do we start with? It depends on what work you're currently doing. Remember, we want this person to ship something to production, so if your work is mostly JavaScript, then it might not make sense to teach this person HTML immediately. On the other hand, if you're doing more design work, then focusing on HTML and then CSS would make more sense.

## How to Begin

When it comes to mentoring, I've found that having a mix of pairing and then independent practice to be effective for skill development. The pairing helps set the tone and provides the tools they need, whereas the independent time allows them to practice and get feedback from you, helping them iterate on the process.

### Creating a Repository

If you can have them learn/experiment in your main repository, then awesome, feel free to skip this step. 

If not, I would spend the first session helping them get their first repository stood up and walk them through switching branches, adding a file (like a README), creating a pull request, and merging that in.

### Pair On Something Small

To start, I would make sure that we created a basic scaffolding so that they could run their project and see their changes. For example, if I were teaching HTML, we'd work to create a file that printed Hello World and get that to show up in the browser. To simplify, I would have a simple `.html` file that they could open up. 

Once the scaffolding was in place, I would pair with them to teach some fundamental concepts and then give them an assignment to code independently. For example, if they're learning HTML, we'd work together to build a version of the Google home page as it's relatively simple and teaches them about labels, input controls, and buttons.

### Let Them Work

Once we've spent some time with the basics, we can reinforce that skill by having them work solo on an assignment. It's this independent time where they start learning those skills, get stuck, ask questions, but overall, make progress. For you, this is also where you can see what they're getting quickly and where they're struggling.

For example, if we just built out the google.com page, I would give them an assignment to build a form page, as it uses the same concepts but forces them to think about how to structure it and apply those principles. The work you give should be accomplishable within a couple of hours, as anything that takes multiple days will kill any momentum they would gain.

### Give Feedback

When the work is ready, they need to create a pull request and have you (and ideally your team) review their changes. It can be a nerve wracking experience for them as this may be their first time having their work critiqued as a professional, so keep in mind the tone and the verbiage used.

One thing that can help is to walk them through how you do a code review, what you're looking for, and how you deliver feedback as this gives them context of what's expected of them.

## How To Grow

Once they've completed an assignment or two, see how they can plug into your current work. If they've been learning about HTML and you have a story for creating a new page, pull them in and pair on it. For example, you could pair on making the basic page and connections to the CSS and JavaScript, but then they could work independently on building the page out while you work on the other aspects.

By dividing the work up, you're allowing them autonomy in how the work gets done, it helps you out, and gives them experience of working on a project, in the smaller scale.

----

_Do you have a question about leadership, career, or software engineering? Would you like a different perspective on these topics? Drop a line at [CoachingCorner@TheSoftwareMentor.com](mailto:CoachingCorner@TheSoftwareMentor.com) or fill out [this form](https://forms.gle/eTqzoUo5hFWrmVKK6)._ 


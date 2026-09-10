# Repository playwrite_tests, AI usage report

The parts where AI aided the design - Claude used:

* The documentation in the [README.md](../README.md) is partly produced using __Sonnet 5__, e.g. the description of starting from a clean slate until running the actual test start command. The produce is slightly tweaked also after reviewing.

* The design report skeleton is drafted using Sonnet 5, the text content is only error-checked with sonnet, since written in VSCode with no spell checker

* The description of the test suite in the design report is used as partial input for __Sonnet 5__ for aiding in creating the 2 through 6 test cases using __Claude Code - Claude Sonnet 4.6__ and the parts not handling login or the login Page Object. Hence the length of the [test_design.md](./test_design.md)

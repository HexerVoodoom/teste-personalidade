import assert from "node:assert/strict";
import test from "node:test";
import { randomOnboarding, randomAnswers } from "./random";
import { items } from "@/lib/personality/questions";
import { isComplete } from "@/lib/personality/scoring";

test("randomOnboarding produces a payload accepted by buildSoulProfile", () => {
  for (let i = 0; i < 20; i++) {
    const data = randomOnboarding();
    assert.match(data.birthDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(data.birthTime, /^\d{2}:\d{2}$/);
    assert.equal(data.timeUnknown, false);
    assert.ok(data.fullName.trim().split(/\s+/).length >= 2);
    assert.ok(data.latitude >= -90 && data.latitude <= 90);
    assert.ok(data.longitude >= -180 && data.longitude <= 180);
    assert.doesNotThrow(() => new Intl.DateTimeFormat("en-US", { timeZone: data.timeZone }));
  }
});

test("randomAnswers always produces a complete, valid answer set", () => {
  for (let i = 0; i < 20; i++) {
    const answers = randomAnswers();
    assert.equal(isComplete(answers), true);
    for (const item of items) {
      const answer = answers[item.id];
      if (item.kind === "likert" || item.kind === "frequency") {
        assert.equal(answer.kind, "likert");
        if (answer.kind === "likert") assert.ok(answer.value >= 1 && answer.value <= 5);
      } else if (item.kind === "forced-choice") {
        assert.equal(answer.kind, "forced-choice");
      } else if (item.kind === "scenario") {
        assert.equal(answer.kind, "scenario");
        if (answer.kind === "scenario") {
          assert.ok(item.options.some((o) => o.id === answer.optionId));
        }
      }
    }
  }
});

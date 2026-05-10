# MVP Plan

## Week 1

- Build local corpus format
- Implement lexical retrieval over passages and concepts
- Implement perspective-aware query expansion
- Build local HTTP API
- Build browser demo

## Week 2

- Expand passage coverage
- Add evaluation questions
- Add OpenAI-compatible generation option
- Add theme heatmap
- Write portfolio README and architecture diagram

## Precision Roadmap

If answers feel imprecise, improve the system in this order:

1. Expand corpus coverage.
   - Add at least chapters 1-30 first.
   - Add key later chapters: 56, 74, 78, 106, 120.
   - Missing chapters cannot be fixed by prompting.

2. Improve retrieval.
   - Normalize simplified/traditional variants.
   - Use BM25 or hybrid retrieval.
   - Prefer exact phrase matches for named scenes such as 太虚幻境, 好了歌, 葬花, 仕途经济.

3. Improve concept grounding.
   - Expand the philosophy concept file from 10 concepts to 30-50.
   - Add aliases and example textual signals for each concept.

4. Add LLM generation.
   - Feed only retrieved passages and concepts into the model.
   - Require answer sections: thesis, textual evidence, philosophical concepts, interpretation, limits.

5. Add evaluation.
   - Use 30-50 questions.
   - Track retrieval hit rate, perspective consistency, citation faithfulness, and structure compliance.

## Evaluation Ideas

- Retrieval precision: whether top passages contain relevant characters/themes
- Citation faithfulness: whether answer claims are supported by retrieved evidence
- Perspective consistency: whether 儒家/道家/佛教 outputs use the selected framework
- Human review: manually score 30 literary-philosophy questions

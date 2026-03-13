<?php

namespace App\Enums;

enum ExerciseStylePhase: int
{
    case Exact = 1;
    case Flexible = 2;
    case Fallback = 3;
}

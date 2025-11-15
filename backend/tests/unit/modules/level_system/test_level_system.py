import pytest
from backend.app.modules.level_system.utils import get_speed_from_level_score


class TestGetSpeedFromLevelScore:
    """get_speed_from_level_score 함수에 대한 유닛 테스트"""

    def test_boundary_values(self):
        """경계값들이 올바른 속도를 반환하는지 테스트"""
        test_cases = [
            (0, 0.75),      # A1 시작
            (25, 0.80),     # A2 시작 / A1 끝
            (50, 0.90),     # B1 시작 / A2 끝
            (100, 1.00),    # B2 시작 / B1 끝
            (150, 1.08),    # C1 시작 / B2 끝
            (200, 1.12),    # C1 끝
        ]
        
        for level_score, expected_speed in test_cases:
            actual_speed = get_speed_from_level_score(level_score)
            assert actual_speed == expected_speed, (
                f"Level score {level_score}: expected {expected_speed}, got {actual_speed}"
            )

    def test_interpolation(self):
        """구간 내에서 선형 보간이 올바르게 작동하는지 테스트"""
        
        # A1 구간 (0-25): 0.75 -> 0.80
        # 중간값 12.5에서 0.775가 나와야 함
        mid_score = 12.5
        expected_mid_speed = 0.75 + (0.80 - 0.75) * (12.5 / 25)  # 0.775
        actual_mid_speed = get_speed_from_level_score(mid_score)
        assert abs(actual_mid_speed - expected_mid_speed) < 0.01, (
            f"A1 중간값 {mid_score}: expected ~{expected_mid_speed:.3f}, got {actual_mid_speed}"
        )
        
        # A2 구간 (25-50): 0.80 -> 0.90
        # 37.5에서 0.85가 나와야 함
        mid_score = 37.5
        expected_mid_speed = 0.80 + (0.90 - 0.80) * ((37.5 - 25) / (50 - 25))  # 0.85
        actual_mid_speed = get_speed_from_level_score(mid_score)
        assert abs(actual_mid_speed - expected_mid_speed) < 0.01, (
            f"A2 중간값 {mid_score}: expected ~{expected_mid_speed:.3f}, got {actual_mid_speed}"
        )
        
        # B1 구간 (50-100): 0.90 -> 1.00
        # 75에서 0.95가 나와야 함
        mid_score = 75
        expected_mid_speed = 0.90 + (1.00 - 0.90) * ((75 - 50) / (100 - 50))  # 0.95
        actual_mid_speed = get_speed_from_level_score(mid_score)
        assert abs(actual_mid_speed - expected_mid_speed) < 0.01, (
            f"B1 중간값 {mid_score}: expected ~{expected_mid_speed:.3f}, got {actual_mid_speed}"
        )
        
        # B2 구간 (100-150): 1.00 -> 1.08
        # 125에서 1.04가 나와야 함
        mid_score = 125
        expected_mid_speed = 1.00 + (1.08 - 1.00) * ((125 - 100) / (150 - 100))  # 1.04
        actual_mid_speed = get_speed_from_level_score(mid_score)
        assert abs(actual_mid_speed - expected_mid_speed) < 0.01, (
            f"B2 중간값 {mid_score}: expected ~{expected_mid_speed:.3f}, got {actual_mid_speed}"
        )
        
        # C1 구간 (150-200): 1.08 -> 1.12
        # 175에서 1.10이 나와야 함
        mid_score = 175
        expected_mid_speed = 1.08 + (1.12 - 1.08) * ((175 - 150) / (200 - 150))  # 1.10
        actual_mid_speed = get_speed_from_level_score(mid_score)
        assert abs(actual_mid_speed - expected_mid_speed) < 0.01, (
            f"C1 중간값 {mid_score}: expected ~{expected_mid_speed:.3f}, got {actual_mid_speed}"
        )

    def test_edge_cases(self):
        """경계 케이스들을 테스트"""
        
        # 최소값 이하
        assert get_speed_from_level_score(-10) == 0.75
        assert get_speed_from_level_score(0) == 0.75
        
        # 최대값 이상
        assert get_speed_from_level_score(250) == 1.13
        assert get_speed_from_level_score(300) == 1.13
        assert get_speed_from_level_score(1000) == 1.13
        
        # 200-250 구간
        assert get_speed_from_level_score(200) == 1.12
        assert get_speed_from_level_score(225) == 1.12  # 200 이상은 모두 1.12

    def test_precision(self):
        """반환값의 정밀도가 올바른지 테스트 (소수점 둘째 자리까지)"""
        
        # 여러 값들에 대해 소수점 둘째 자리까지만 나오는지 확인
        test_scores = [12.5, 37.5, 75, 125, 175]
        
        for score in test_scores:
            result = get_speed_from_level_score(score)
            # 소수점 둘째 자리까지만 있는지 확인 (round(x, 2) == x)
            assert round(result, 2) == result, (
                f"Score {score}: result {result} should be rounded to 2 decimal places"
            )